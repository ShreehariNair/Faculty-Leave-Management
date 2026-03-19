const mongoose = require("mongoose");

/**
 * FacultyTimetable
 * Stores a faculty's weekly busy slots as strings like "Monday-09:00".
 * Uploaded/managed by the faculty themselves.
 */
const facultyTimetableSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    busySlots: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      enum: ["manual_upload"],
      default: "manual_upload",
    },
  },
  { timestamps: true },
);

facultyTimetableSchema.index({ department: 1, faculty: 1 });

module.exports = mongoose.model("FacultyTimetable", facultyTimetableSchema);

