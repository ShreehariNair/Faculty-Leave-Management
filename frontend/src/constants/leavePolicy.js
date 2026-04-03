/* ─────────────────────────────────────────────────────────────
   Pillai College of Engineering — Leave Policy Constants
   Must match backend leaveModel.js and leaveBalanceModel.js
   ───────────────────────────────────────────────────────────── */

// ADD THIS at the very top (line 1):
import {
  BeachAccess,
  LocalHospital,
  Star,
  Repeat,
  AccountBalance,
  PauseCircle,
  WorkOff,
} from "@mui/icons-material";

export const ACADEMIC_YEAR_START_MONTH = 7; // August (0-indexed)
export const ADVANCE_NOTICE_DAYS = 4;
export const ADVANCE_NOTICE_EXEMPT = ["casual", "medical"];
export const EL_ACCRUAL_FRACTION = 1 / 3;
export const ML_CERTIFICATE_REQUIRED = true;

/* ── Leave entitlements keyed by role ── */
export const LEAVE_ENTITLEMENTS = {
  faculty: {
    casual: {
      label: "Casual Leave",
      days: 8,
      payStatus: "full",
      advanceNotice: false,
      roles: ["faculty", "hod", "admin"],
    },
    medical: {
      label: "Medical Leave",
      days: 10,
      payStatus: "full",
      advanceNotice: false,
      roles: ["faculty", "hod", "admin"],
      note: "Physician's certificate required on return.",
    },
    earned: {
      label: "Earned Leave",
      days: 0,
      payStatus: "full",
      advanceNotice: true,
      roles: ["faculty", "hod", "admin"],
      note: "1/3 of detention days. Non-active periods only. Cannot carry forward.",
    },
    onDuty: {
      label: "On Duty",
      days: 0,
      payStatus: "full",
      advanceNotice: false,
      roles: ["faculty", "hod", "admin"],
      note: "Assigned duty by institute, university or state.",
    },
    special: {
      label: "Special Leave",
      days: 0,
      payStatus: "none",
      advanceNotice: true,
      roles: ["faculty", "hod", "admin"],
      note: "No salary or allowances. Only when no other leave is available.",
    },
    leaveWithoutPay: {
      label: "Leave Without Pay",
      days: 0,
      payStatus: "none",
      advanceNotice: true,
      roles: ["faculty", "hod", "admin"],
      note: "Prolonged illness beyond accumulated leaves or exceptional reasons.",
    },
  },
  admin: {
    casual: {
      label: "Casual Leave",
      days: 8,
      payStatus: "full",
      advanceNotice: false,
    },
    medical: {
      label: "Medical Leave",
      days: 10,
      payStatus: "full",
      advanceNotice: false,
      note: "Physician's certificate required on return.",
    },
    compensatory: {
      label: "Compensatory Leave",
      days: 0,
      payStatus: "full",
      advanceNotice: false,
      note: "Equal to holidays worked. Cannot attach to CL. Not during academic sessions.",
    },
    earned: {
      label: "Earned Leave",
      days: 0,
      payStatus: "full",
      advanceNotice: true,
    },
    onDuty: {
      label: "On Duty",
      days: 0,
      payStatus: "full",
      advanceNotice: false,
    },
    special: {
      label: "Special Leave",
      days: 0,
      payStatus: "none",
      advanceNotice: true,
    },
    leaveWithoutPay: {
      label: "Leave Without Pay",
      days: 0,
      payStatus: "none",
      advanceNotice: true,
    },
  },
};
LEAVE_ENTITLEMENTS.hod = LEAVE_ENTITLEMENTS.faculty;

/* ── UI metadata ── */
export const LEAVE_TYPE_META = {
  casual: {
    label: "Casual Leave",
    color: "#7c3aed",
    bg: "#f5f3ff",
    icon: BeachAccess,
    code: "CL",
  },
  medical: {
    label: "Medical Leave",
    color: "#ef4444",
    bg: "#fee2e2",
    icon: LocalHospital,
    code: "ML",
  },
  earned: {
    label: "Earned Leave",
    color: "#10b981",
    bg: "#ecfdf5",
    icon: Star,
    code: "EL",
  },
  compensatory: {
    label: "Compensatory Leave",
    color: "#0891b2",
    bg: "#ecfeff",
    icon: Repeat,
    code: "CO",
  },
  onDuty: {
    label: "On Duty",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    icon: AccountBalance,
    code: "OD",
  },
  special: {
    label: "Special Leave",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: PauseCircle,
    code: "SP",
  },
  leaveWithoutPay: {
    label: "Leave Without Pay",
    color: "#64748b",
    bg: "#f1f5f9",
    icon: WorkOff,
    code: "LWP",
  },
};

/* ── Status label + colour ── */
export const STATUS_META = {
  pending: { label: "Pending", bg: "#fef9c3", color: "#854d0e" },
  hod_approved: { label: "HOD Approved", bg: "#dbeafe", color: "#1e40af" },
  approved: { label: "Approved", bg: "#dcfce7", color: "#166534" },
  rejected: { label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
  cancelled: { label: "Cancelled", bg: "#f1f5f9", color: "#475569" },
};

/* ── Balance field name → display key mapping ── */
export const BALANCE_DISPLAY_KEYS = [
  { key: "casual", label: "Casual Leave", code: "CL", color: "#7c3aed" },
  { key: "medical", label: "Medical Leave", code: "ML", color: "#ef4444" },
  { key: "earned", label: "Earned Leave", code: "EL", color: "#10b981" },
  {
    key: "compensatory",
    label: "Compensatory Leave",
    code: "CO",
    color: "#0891b2",
  },
  { key: "onDuty", label: "On Duty", code: "OD", color: "#8b5cf6" },
  { key: "special", label: "Special Leave", code: "SP", color: "#f59e0b" },
  {
    key: "leaveWithoutPay",
    label: "Leave Without Pay",
    code: "LWP",
    color: "#64748b",
  },
];

export const PUBLIC_HOLIDAYS = [
  "Janmashtami",
  "Ganesh Chaturthi",
  "Id-ul-Fitr",
  "Onam",
  "Gandhi Jayanti",
  "Dussehra",
  "Bakri Id",
  "Mahashivratri",
  "Shivaji Jayanti",
  "Ramnavmi",
  "Good Friday",
];

export const HOLIDAY_ENTITLEMENTS = {
  faculty: {
    totalHolidayDays: 60,
    periods: [
      { name: "Ganesh Chaturthi", approxDays: 5 },
      { name: "Diwali", approxDays: 5 },
      { name: "Christmas", approxDays: 5 },
      { name: "Summer Vacation", approxDays: 45 },
    ],
    note: "Vacations may be shortened if syllabus/internal assessments are incomplete.",
  },
  admin: {
    specificHolidays: [
      { name: "Ganesh Chaturthi", days: 3 },
      { name: "Diwali", days: 5 },
    ],
    note: "Applicable only when institute is not working.",
  },
};
