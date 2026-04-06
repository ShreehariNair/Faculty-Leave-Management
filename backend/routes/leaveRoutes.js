const express = require("express");
const router = express.Router();

const Leave = require("../models/leaveModel");
const LeaveBalance = require("../models/leaveBalanceModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Timetable = require("../models/timetableModel");
const FacultyTimetable = require("../models/facultyTimetableModel");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/leaveUpload");
const cloudinary = require("../config/cloudinary");

const {
  suggestSubstitutes,
  analyzeWorkloadImpact,
  predictLeaveRisk,
  generateRecommendations,
  detectAnomalies,
} = require("../utils/aiEngine");

/* ─── Cloudinary helper ─────────────────────────────────────── */
const uploadToCloudinary = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "auto" }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      })
      .end(fileBuffer);
  });

/* ─── constants ──────────────────────────────────────────────── */
const ADVANCE_NOTICE_EXEMPT = ["casual", "medical"];
const ADVANCE_NOTICE_DAYS = 4; // working days
const EL_ACCRUAL_FRACTION = 1 / 3;
const ML_CERTIFICATE_REQUIRED = true;

/* Leaves whose balance is tracked */
const TRACKED_LEAVE_TYPES = ["casual", "medical"];

/* helpers */
const toBool = (v) => v === true || v === "true";
const toNum = (v, fallback = 0) => {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string") return [];
  const s = v.trim();
  if (!s) return [];
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
};

const workingDaysUntil = (targetDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  if (target <= today) return 0;

  let count = 0;
  const d = new Date(today);
  while (d < target) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) count++; // Mon–Fri
  }
  return count;
};

const getDeductionDays = (leave) => {
  // Policy: CL can be half-day; deduct 0.5 in that case.
  if (leave.leaveType === "casual" && leave.dayType === "HALF") return 0.5;
  // Default: deduct workingDays if present, else totalDays
  return leave.workingDays || leave.totalDays;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const enumerateDaysInclusive = (startDate, endDate) => {
  const s = new Date(startDate);
  const e = new Date(endDate);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  const days = [];
  const cur = new Date(s);
  while (cur <= e) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

const extractFacultySlotsFromTimetables = (
  timetables,
  facultyId,
  dayNameSet,
) => {
  const fid = facultyId?.toString?.()
    ? facultyId.toString()
    : String(facultyId);
  const slots = new Set();

  for (const tt of timetables) {
    const schedule = tt?.schedule;
    if (!schedule) continue;

    schedule.forEach((cell, key) => {
      const day = String(key).split("-")[0];
      if (!dayNameSet.has(day)) return;

      if (!cell) return;
      const cellFaculty = cell.faculty?.toString?.()
        ? cell.faculty.toString()
        : cell.faculty
          ? String(cell.faculty)
          : null;

      if (cellFaculty && cellFaculty === fid) {
        slots.add(String(key));
        return;
      }

      const batches = Array.isArray(cell.batches) ? cell.batches : [];
      for (const b of batches) {
        const bf = b?.faculty?.toString?.()
          ? b.faculty.toString()
          : b?.faculty
            ? String(b.faculty)
            : null;
        if (bf && bf === fid) {
          slots.add(String(key));
          return;
        }
      }
    });
  }

  return slots;
};

const extractBusySlotsForCandidate = (timetables, candidateId, dayNameSet) => {
  return extractFacultySlotsFromTimetables(timetables, candidateId, dayNameSet);
};

const computeLeaveAffectedSlotsFromFacultyUpload = async (
  facultyId,
  sd,
  ed,
) => {
  const tt = await FacultyTimetable.findOne({ faculty: facultyId }).lean();
  const busy = new Set((tt?.busySlots || []).map((s) => String(s)));
  if (busy.size === 0) return new Set();

  const dayNamesInRange = new Set(
    enumerateDaysInclusive(sd, ed)
      .map((d) => DAY_NAMES[d.getDay()])
      .filter((n) => n !== "Sunday"),
  );

  const affected = new Set();
  for (const slot of busy) {
    const day = slot.split("-")[0];
    if (dayNamesInRange.has(day)) affected.add(slot);
  }
  return affected;
};

/* ─────────────────────────────────────────────────────────────
   GET /api/leaves
   Faculty: own leaves | HOD/Admin: all leaves
   ───────────────────────────────────────────────────────────── */
router.get("/", protect, async (req, res) => {
  try {
    const query = req.user.role === "faculty" ? { faculty: req.user._id } : {};
    const leaves = await Leave.find(query)
      .populate("faculty", "name email department designation role")
      .populate("hodApproval.approvedBy", "name email")
      .populate("principalApproval.approvedBy", "name email")
      .populate("substituteAssigned", "name email department")
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/leaves/balance
   Returns current faculty's leave balance with remaining days
   ───────────────────────────────────────────────────────────── */
router.get("/balance", protect, async (req, res) => {
  try {
    const balance = await LeaveBalance.getOrCreateForUser(req.user._id);
    res.json(balance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/leaves/balance/all       (HOD / Admin only)
   Returns leave balances for all faculty in the department
   ───────────────────────────────────────────────────────────── */
router.get("/balance/all", protect, async (req, res) => {
  try {
    if (req.user.role === "faculty") {
      return res.status(403).json({ message: "HOD/Admin access required" });
    }

    // HOD: their department only. Admin: everyone.
    const userFilter =
      req.user.role === "hod"
        ? { role: "faculty", department: req.user.department }
        : { role: "faculty" };

    const facultyList = await User.find(userFilter).select("_id name email department");
    const facultyIds = facultyList.map((f) => f._id);

    // Ensure balance records exist for all faculty
    const balances = await Promise.all(
      facultyIds.map((id) => LeaveBalance.getOrCreateForUser(id))
    );

    // Attach faculty info to each balance
    const result = balances.map((bal) => {
      const faculty = facultyList.find(
        (f) => f._id.toString() === bal.faculty.toString()
      );
      return { ...bal.toJSON(), facultyInfo: faculty };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/leaves/balance/:facultyId   (HOD / Admin only)
   Returns a specific faculty member's leave balance
   ───────────────────────────────────────────────────────────── */
router.get("/balance/:facultyId", protect, async (req, res) => {
  try {
    if (req.user.role === "faculty") {
      return res.status(403).json({ message: "HOD/Admin access required" });
    }

    const faculty = await User.findById(req.params.facultyId).select("name email department");
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // HOD can only view their own department's faculty
    if (req.user.role === "hod" && faculty.department !== req.user.department) {
      return res.status(403).json({ message: "You can only view your department's faculty" });
    }

    const balance = await LeaveBalance.getOrCreateForUser(req.params.facultyId);
    res.json({ success: true, data: { ...balance.toJSON(), facultyInfo: faculty } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/leaves/balance/:facultyId   (Admin only)
   Manually override a specific leave type total
   Body: { leaveType: "casual", total: 10 }
   ───────────────────────────────────────────────────────────── */
router.put("/balance/:facultyId", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { leaveType, total } = req.body;
    const validTypes = ["casual", "medical", "earned", "compensatory", "onDuty", "special", "leaveWithoutPay"];

    if (!validTypes.includes(leaveType)) {
      return res.status(400).json({ message: `Invalid leaveType. Allowed: ${validTypes.join(", ")}` });
    }
    if (typeof total !== "number" || total < 0) {
      return res.status(400).json({ message: "total must be a non-negative number" });
    }

    const balance = await LeaveBalance.getOrCreateForUser(req.params.facultyId);
    balance[leaveType].total = total;
    await balance.save();

    res.json({ success: true, message: `${leaveType} leave total updated to ${total}`, data: balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   GET /api/leaves/ai-insights
   ───────────────────────────────────────────────────────────── */
router.get("/ai-insights", protect, async (req, res) => {
  try {
    const leaveHistory = await Leave.find({
      faculty: req.user._id,
      status: { $in: ["approved", "rejected"] },
    });
    const currentLeaves = await Leave.find({ status: "pending" });
    const allLeaves = await Leave.find({ status: "approved" });

    res.json({
      riskScore: predictLeaveRisk(leaveHistory),
      recommendations: generateRecommendations(
        req.user,
        leaveHistory,
        currentLeaves,
      ),
      anomalies: detectAnomalies(leaveHistory),
      workloadImpact: analyzeWorkloadImpact(allLeaves, req.user.department),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/substitutes", protect, async (req, res) => {
  try {
    const faculty = await User.find({
      role: "faculty",
      department: req.user.department,
      _id: { $ne: req.user._id },
    });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/leaves — Apply for leave (JSON or multipart)
   attachment field: "attachment"
   ───────────────────────────────────────────────────────────── */
router.post("/", protect, upload.single("attachment"), async (req, res) => {
  try {
    const leaveType = req.body.leaveType;
    const startDateRaw = req.body.startDate;
    const endDateRaw = req.body.endDate;
    const reason = req.body.reason;

    const dayType = req.body.dayType || "FULL";
    const halfSession =
      dayType === "HALF" ? req.body.halfSession || "FN" : null;

    const substituteRequested = req.body.substituteRequested || "";
    const affectedClasses = toArray(req.body.affectedClasses);

    const isUrgent = toBool(req.body.isUrgent);
    const elDetentionDays = toNum(req.body.elDetentionDays, 0);
    const coHolidaysWorked = toNum(req.body.coHolidaysWorked, 0);
    const isDuringExamPeriod = toBool(req.body.isDuringExamPeriod);
    const isDuringTeaching = toBool(req.body.isDuringTeaching);

    if (!leaveType || !startDateRaw || !endDateRaw || !reason) {
      return res.status(400).json({
        message: "leaveType, startDate, endDate and reason are required.",
      });
    }

    if (!Leave.LEAVE_TYPES.includes(leaveType)) {
      return res.status(400).json({
        message: `Invalid leaveType. Allowed: ${Leave.LEAVE_TYPES.join(", ")}`,
      });
    }

    const sd = new Date(startDateRaw);
    const ed = new Date(endDateRaw);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return res.status(400).json({ message: "Invalid startDate or endDate." });
    }
    if (ed < sd) {
      return res
        .status(400)
        .json({ message: "endDate cannot be before startDate." });
    }

    // CO restriction
    const adminOnly = ["compensatory"];
    if (adminOnly.includes(leaveType) && req.user.role === "faculty") {
      return res.status(400).json({
        message:
          "Compensatory Leave is only applicable to administrative and supporting staff.",
      });
    }

    // Half-day only CL and same date
    if (dayType === "HALF") {
      if (leaveType !== "casual") {
        return res
          .status(400)
          .json({ message: "Half-day is allowed only for Casual Leave." });
      }
      if (sd.toDateString() !== ed.toDateString()) {
        return res
          .status(400)
          .json({ message: "Half-day leave must be for a single date." });
      }
    }

    // CL max 3 continuous (sandwich counted)
    if (leaveType === "casual") {
      Leave.validateCasualMaxContinuous(sd, ed, dayType);
    }

    // advance notice -> treat as LWP except CL/ML
    const advanceDays = workingDaysUntil(sd);
    const treatAsLWP =
      !ADVANCE_NOTICE_EXEMPT.includes(leaveType) &&
      advanceDays < ADVANCE_NOTICE_DAYS;

    const totalDays = Leave.calcCalendarDays(sd, ed);
    const workingDays = Leave.calcWorkingDays(sd, ed);

    // ML certificate rules
    const mlCertificateRequired =
      leaveType === "medical" && ML_CERTIFICATE_REQUIRED;
    const fitnessCertificateRequired =
      leaveType === "medical" && totalDays >= 3;

    if (req.file && leaveType !== "medical") {
      return res.status(400).json({
        message: "Attachment upload is only allowed for medical leave.",
      });
    }
    if (mlCertificateRequired && !req.file) {
      return res.status(400).json({
        message: "Medical leave requires uploading a certificate (attachment).",
      });
    }

    // ✅ Balance check for tracked leave types — with remaining info in response
    if (TRACKED_LEAVE_TYPES.includes(leaveType)) {
      const balance = await LeaveBalance.getOrCreateForUser(req.user._id);
      const balKey = Leave.BALANCE_KEY_MAP[leaveType];

      const requested =
        leaveType === "casual" && dayType === "HALF" ? 0.5 : workingDays;
      const remaining = balance?.[balKey]
        ? balance[balKey].total - balance[balKey].used
        : null;

      if (remaining !== null && requested > remaining) {
        return res.status(400).json({
          message:
            `Insufficient ${leaveType} leave. Available: ${remaining} day(s). ` +
            `Excess days may be treated as Leave Without Pay.`,
          remaining,
        });
      }
    }

    // Substitute auto-suggest using timetable availability
    const department = req.user.department;
    const timetables = await Timetable.find({
      department,
      isActive: true,
    }).select("schedule department");

    const dayNamesInRange = new Set(
      enumerateDaysInclusive(sd, ed)
        .map((d) => DAY_NAMES[d.getDay()])
        .filter((n) => n !== "Sunday"),
    );

    const affectedSlotsFromTimetable = extractFacultySlotsFromTimetables(
      timetables,
      req.user._id,
      dayNamesInRange,
    );

    const affectedSlots = new Set([
      ...Array.from(affectedSlotsFromTimetable),
      ...(affectedClasses || []),
    ]);

    const availableFaculty = await User.find({
      isAvailable: true,
      role: "faculty",
      department,
    }).select("_id name email department subjects isAvailable");

    const timetableFiltered = availableFaculty.filter((candidate) => {
      if (candidate._id.toString() === req.user._id.toString()) return false;
      if (affectedSlots.size === 0) return true;
      const busy = extractBusySlotsForCandidate(
        timetables,
        candidate._id,
        dayNamesInRange,
      );
      for (const slot of affectedSlots) {
        if (busy.has(String(slot))) return false;
      }
      return true;
    });

    const autoSub =
      suggestSubstitutes(timetableFiltered, req.user)[0]?._id || null;
    const history = await Leave.find({ faculty: req.user._id });

    /* Upload attachment to Cloudinary if present */
    let attachmentUrl = null;
    let attachmentPublicId = null;
    if (req.file) {
      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "leave-certificates",
      );
      attachmentUrl = uploaded.secure_url;
      attachmentPublicId = uploaded.public_id;
    }

    const leave = await Leave.create({
      faculty: req.user._id,
      leaveType,

      startDate: sd,
      endDate: ed,

      totalDays,
      workingDays,
      sandwichCountedDays: totalDays,

      dayType,
      halfSession,

      reason,
      treatAsLWP,
      advanceNoticeDays: advanceDays,

      substituteRequested,
      substituteAssigned: autoSub,

      affectedClasses: Array.from(affectedSlots),
      isUrgent: isUrgent || false,
      isDuringExamPeriod: isDuringExamPeriod || false,
      isDuringTeaching: isDuringTeaching || false,

      elDetentionDays: elDetentionDays || 0,
      coHolidaysWorked: coHolidaysWorked || 0,

      mlCertificateRequired,
      mlCertificateReceived: false,
      mlCertificateAttachment: attachmentUrl,
      mlCertificatePublicId: attachmentPublicId,
      fitnessCertificateRequired,

      aiPredictionScore: predictLeaveRisk(history),
    });

    const admins = await User.find({ role: { $in: ["admin", "hod"] } });
    const lwpNote = treatAsLWP
      ? " ⚠ Notice < 4 working days — may be treated as LWP."
      : "";
    await Notification.insertMany(
      admins.map((admin) => ({
        recipient: admin._id,
        sender: req.user._id,
        type: "leave_applied",
        message:
          `${req.user.name} applied for ${leaveType} leave ` +
          `(${sd.toDateString()} → ${ed.toDateString()}, ${totalDays} day(s)).${lwpNote}`,
        relatedLeave: leave._id,
      })),
    );

    const populated = await Leave.findById(leave._id)
      .populate("faculty", "name email department designation")
      .populate("substituteAssigned", "name email department");

    res.status(201).json(populated);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/leaves/:id/reject
   ✅ Now restores balance if leave was already approved
   ───────────────────────────────────────────────────────────── */
router.put("/:id/reject", protect, async (req, res) => {
  try {
    if (req.user.role !== "hod" && req.user.role !== "admin") {
      return res.status(403).json({ message: "HOD/Admin access required" });
    }

    const leave = await Leave.findById(req.params.id).populate("faculty");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.status !== "pending" && leave.status !== "hod_approved") {
      return res.status(400).json({
        message: "Leave can only be rejected when pending or HOD-approved",
      });
    }

    // ✅ If leave was already approved and balance was deducted, restore it
    if (leave.status === "approved") {
      const balKey = Leave.BALANCE_KEY_MAP[leave.leaveType];
      if (balKey && TRACKED_LEAVE_TYPES.includes(leave.leaveType)) {
        const deduction = getDeductionDays(leave);
        await LeaveBalance.restoreBalance(leave.faculty._id, balKey, deduction);
      }
    }

    leave.status = "rejected";
    leave.rejectionReason = req.body.rejectionReason || "";
    await leave.save();

    await Notification.create({
      recipient: leave.faculty._id,
      sender: req.user._id,
      type: "leave_rejected",
      message: `Your ${leave.leaveType} leave has been rejected by ${req.user.name}.`,
      relatedLeave: leave._id,
    });

    res.json({ message: "Leave rejected", leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/leaves/:id/hod-approve
   ───────────────────────────────────────────────────────────── */
router.put("/:id/hod-approve", protect, async (req, res) => {
  try {
    if (req.user.role !== "hod" && req.user.role !== "admin")
      return res.status(403).json({ message: "HOD access required" });

    const leave = await Leave.findById(req.params.id).populate("faculty");
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    if (leave.status !== "pending")
      return res.status(400).json({ message: "Leave is not in pending state" });

    leave.status = "hod_approved";
    leave.hodApproval = {
      approvedBy: req.user._id,
      approvalDate: new Date(),
      remarks: req.body.remarks || "",
    };
    await leave.save();

    const principals = await User.find({ role: "admin" });
    await Notification.insertMany(
      principals.map((p) => ({
        recipient: p._id,
        sender: req.user._id,
        type: "leave_applied",
        message: `HOD ${req.user.name} approved ${leave.faculty.name}'s ${leave.leaveType} leave. Awaiting principal approval.`,
        relatedLeave: leave._id,
      })),
    );

    await Notification.create({
      recipient: leave.faculty._id,
      sender: req.user._id,
      type: "leave_approved",
      message: `Your ${leave.leaveType} leave has been approved by HOD ${req.user.name}. Awaiting principal/management approval.`,
      relatedLeave: leave._id,
    });

    res.json({ message: "HOD approval granted", leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/leaves/:id/approve (Principal/Admin final)
   ✅ Deducts leave balance after full approval
   ───────────────────────────────────────────────────────────── */
router.put("/:id/approve", protect, async (req, res) => {
  try {
    if (req.user.role === "faculty")
      return res.status(403).json({ message: "Not authorized" });

    const leave = await Leave.findById(req.params.id).populate("faculty");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.status !== "hod_approved" && leave.status !== "pending") {
      return res.status(400).json({
        message: "Leave must be HOD-approved before principal approval",
      });
    }

    leave.status = "approved";
    leave.principalApproval = {
      approvedBy: req.user._id,
      approvalDate: new Date(),
      remarks: req.body.remarks || "",
    };
    await leave.save();

    // ✅ Assign substitute using uploaded faculty timetables
    try {
      if (!leave.substituteAssigned && leave.faculty?.department) {
        const sd = new Date(leave.startDate);
        const ed = new Date(leave.endDate);

        const affectedSlots = await computeLeaveAffectedSlotsFromFacultyUpload(
          leave.faculty._id,
          sd,
          ed,
        );

        const candidates = await User.find({
          role: "faculty",
          isAvailable: true,
          department: leave.faculty.department,
          _id: { $ne: leave.faculty._id },
        }).select("_id name email department subjects isAvailable");

        let filtered = candidates;
        if (affectedSlots.size > 0) {
          const candidateIds = candidates.map((c) => c._id);
          const tts = await FacultyTimetable.find({
            faculty: { $in: candidateIds },
          })
            .select("faculty busySlots")
            .lean();
          const byFaculty = new Map(
            tts.map((t) => [
              String(t.faculty),
              new Set((t.busySlots || []).map(String)),
            ]),
          );

          filtered = candidates.filter((c) => {
            const busy = byFaculty.get(String(c._id));
            if (!busy) return true;
            for (const slot of affectedSlots) {
              if (busy.has(String(slot))) return false;
            }
            return true;
          });
        }

        const best =
          suggestSubstitutes(filtered, leave.faculty)[0]?._id || null;

        if (best) {
          leave.substituteAssigned = best;
          await leave.save();

          await Notification.insertMany([
            {
              recipient: best,
              sender: req.user._id,
              type: "substitute_assigned",
              message: `You have been assigned as a substitute for ${leave.faculty.name}'s leave (${new Date(
                leave.startDate,
              ).toDateString()} → ${new Date(leave.endDate).toDateString()}).`,
              relatedLeave: leave._id,
            },
            {
              recipient: leave.faculty._id,
              sender: req.user._id,
              type: "substitute_assigned",
              message:
                "A substitute has been assigned for your approved leave.",
              relatedLeave: leave._id,
            },
          ]);
        }
      }
    } catch (e) {
      console.error("Substitute auto-assign on approval failed:", e);
    }

    // ✅ Deduct balance for tracked leave types
    const balKey = Leave.BALANCE_KEY_MAP[leave.leaveType];
    if (balKey && TRACKED_LEAVE_TYPES.includes(leave.leaveType)) {
      const balance = await LeaveBalance.getOrCreateForUser(leave.faculty._id);
      const deduction = getDeductionDays(leave);

      if (balance?.[balKey]) {
        balance[balKey].used += deduction;
        await balance.save();
      }
    }

    const lwpNote = leave.treatAsLWP
      ? " Note: Notice < 4 working days — this may be processed as Leave Without Pay."
      : "";

    await Notification.create({
      recipient: leave.faculty._id,
      sender: req.user._id,
      type: "leave_approved",
      message: `Your ${leave.leaveType} leave has been fully approved by ${req.user.name}.${lwpNote}`,
      relatedLeave: leave._id,
    });

    res.json({ message: "Leave approved", leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   PUT /api/leaves/:id/cancel      (Faculty cancels own leave)
   ✅ Restores balance if leave was approved
   ───────────────────────────────────────────────────────────── */
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Only the faculty who applied can cancel
    if (leave.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only cancel your own leave" });
    }

    if (leave.status === "rejected" || leave.status === "cancelled") {
      return res.status(400).json({ message: "Leave is already rejected or cancelled" });
    }

    // ✅ If leave was approved, restore the balance
    if (leave.status === "approved") {
      const balKey = Leave.BALANCE_KEY_MAP[leave.leaveType];
      if (balKey && TRACKED_LEAVE_TYPES.includes(leave.leaveType)) {
        const deduction = getDeductionDays(leave);
        await LeaveBalance.restoreBalance(leave.faculty, balKey, deduction);
      }
    }

    leave.status = "cancelled";
    await leave.save();

    // Notify HOD and admin
    const admins = await User.find({ role: { $in: ["admin", "hod"] } });
    await Notification.insertMany(
      admins.map((admin) => ({
        recipient: admin._id,
        sender: req.user._id,
        type: "leave_applied",
        message: `${req.user.name} cancelled their ${leave.leaveType} leave (${new Date(leave.startDate).toDateString()} → ${new Date(leave.endDate).toDateString()}).`,
        relatedLeave: leave._id,
      }))
    );

    res.json({ message: "Leave cancelled successfully", leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;