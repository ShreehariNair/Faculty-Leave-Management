const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const FacultyTimetable = require("../models/facultyTimetableModel");

const normalizeSlot = (s) => String(s || "").trim();

/**
 * GET /api/faculty-timetable/me
 * Faculty can view their uploaded timetable.
 */
router.get("/me", protect, async (req, res) => {
  try {
    const tt = await FacultyTimetable.findOne({ faculty: req.user._id });
    return res.json({ success: true, data: tt || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PUT /api/faculty-timetable/me
 * Faculty uploads/updates their timetable busy slots.
 * Body: { busySlots: string[] }
 */
router.put("/me", protect, async (req, res) => {
  try {
    if (req.user.role !== "faculty") {
      return res.status(403).json({ success: false, message: "Faculty only" });
    }

    const raw = Array.isArray(req.body?.busySlots) ? req.body.busySlots : [];
    const busySlots = Array.from(
      new Set(raw.map(normalizeSlot).filter(Boolean)),
    );

    const updated = await FacultyTimetable.findOneAndUpdate(
      { faculty: req.user._id },
      {
        faculty: req.user._id,
        department: req.user.department,
        busySlots,
        source: "manual_upload",
      },
      { upsert: true, new: true },
    );

    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

