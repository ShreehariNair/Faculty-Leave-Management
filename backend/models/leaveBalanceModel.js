const mongoose = require("mongoose");

/* ─────────────────────────────────────────────────────────────
   Pillai College of Engineering — Leave Balance Model
   Academic Year: Aug 1 → Jul 31
   ───────────────────────────────────────────────────────────── */

const leaveTypeSchema = (defaultTotal) => ({
  total: { type: Number, default: defaultTotal },
  used: { type: Number, default: 0 },
});

const getAcademicYearForDate = (dt = new Date()) => {
  return dt.getMonth() >= 7 ? dt.getFullYear() : dt.getFullYear() - 1;
};

const leaveBalanceSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /* Academic year this balance belongs to e.g. 2024 = Aug 2024 → Jul 2025 */
    academicYear: {
      type: Number,
      default: () => getAcademicYearForDate(new Date()),
    },

    /* ── Leave types per Pillai handbook ── */
    casual: leaveTypeSchema(8),         // CL — 8 days
    medical: leaveTypeSchema(10),       // ML — 10 days
    earned: leaveTypeSchema(0),         // EL — accrued
    compensatory: leaveTypeSchema(0),   // CO — admin/support only
    onDuty: leaveTypeSchema(0),         // OD — assigned duty
    special: leaveTypeSchema(0),        // SP — no pay
    leaveWithoutPay: leaveTypeSchema(0),// LWP

    /* Doctor's certificate submitted for ML return */
    mlCertificateSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

/* ── Virtuals: remaining days per leave type ── */
leaveBalanceSchema.virtual("casual.remaining").get(function () {
  return this.casual.total - this.casual.used;
});
leaveBalanceSchema.virtual("medical.remaining").get(function () {
  return this.medical.total - this.medical.used;
});
leaveBalanceSchema.virtual("earned.remaining").get(function () {
  return this.earned.total - this.earned.used;
});
leaveBalanceSchema.virtual("compensatory.remaining").get(function () {
  return this.compensatory.total - this.compensatory.used;
});
leaveBalanceSchema.virtual("onDuty.remaining").get(function () {
  return this.onDuty.total - this.onDuty.used;
});
leaveBalanceSchema.virtual("special.remaining").get(function () {
  return this.special.total - this.special.used;
});
leaveBalanceSchema.virtual("leaveWithoutPay.remaining").get(function () {
  return this.leaveWithoutPay.total - this.leaveWithoutPay.used;
});

/* ── Virtual: total days used across all leave types ── */
leaveBalanceSchema.virtual("totalUsed").get(function () {
  return (
    this.casual.used +
    this.medical.used +
    this.earned.used +
    this.compensatory.used +
    this.onDuty.used +
    this.special.used +
    this.leaveWithoutPay.used
  );
});

leaveBalanceSchema.set("toJSON", { virtuals: true });
leaveBalanceSchema.set("toObject", { virtuals: true });

/**
 * Reset balances for new academic year (Aug 1)
 */
leaveBalanceSchema.methods.resetForNewYear = async function () {
  this.casual = { total: 8, used: 0 };
  this.medical = { total: 10, used: 0 };
  this.earned = { total: 0, used: 0 };
  this.compensatory = { total: 0, used: 0 };
  this.onDuty = { total: 0, used: 0 };
  this.special = { total: 0, used: 0 };
  this.leaveWithoutPay = { total: 0, used: 0 };
  this.mlCertificateSubmitted = false;
  this.academicYear = getAcademicYearForDate(new Date());
  return this.save();
};

/**
 * Ensure this document is for the current academic year.
 * If not, reset.
 */
leaveBalanceSchema.methods.ensureCurrentAcademicYear = async function () {
  const currentYear = getAcademicYearForDate(new Date());
  if (this.academicYear !== currentYear) {
    await this.resetForNewYear();
  }
  return this;
};

/**
 * Static helper: get or create balance and ensure it matches current academic year
 */
leaveBalanceSchema.statics.getOrCreateForUser = async function (userId) {
  let bal = await this.findOne({ faculty: userId });
  if (!bal) {
    bal = await this.create({ faculty: userId });
  }
  await bal.ensureCurrentAcademicYear();
  return bal;
};

/**
 * NEW ✅ Static helper: restore (reverse) a deduction when leave is rejected/cancelled
 * leaveType: the leave type string e.g. "casual"
 * days: number of days to restore
 */
leaveBalanceSchema.statics.restoreBalance = async function (userId, leaveType, days) {
  const bal = await this.getOrCreateForUser(userId);
  if (bal[leaveType]) {
    bal[leaveType].used = Math.max(0, bal[leaveType].used - days);
    await bal.save();
  }
  return bal;
};

leaveBalanceSchema.statics.getAcademicYearForDate = getAcademicYearForDate;

module.exports = mongoose.model("LeaveBalance", leaveBalanceSchema);