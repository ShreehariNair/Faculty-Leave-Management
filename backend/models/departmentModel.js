const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide department name"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Please provide department code"],
      unique: true,
      uppercase: true,
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },
    facultyCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Department", DepartmentSchema);
