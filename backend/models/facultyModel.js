const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide faculty name"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Please provide faculty email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please provide faculty phone"],
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    designation: {
      type: String,
      enum: [
        "Assistant Professor",
        "Associate Professor",
        "Professor",
        "Lecturer",
      ],
      default: "Lecturer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Instance methods
FacultySchema.methods.validateFacultyData = function () {
  const errors = [];

  if (!this.name || this.name.trim().length === 0) {
    errors.push("Faculty name is required");
  }

  if (
    !this.email ||
    !this.email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)
  ) {
    errors.push("Valid email is required");
  }

  if (!this.phone || !this.phone.match(/^\d{10}$/)) {
    errors.push("Phone must be 10 digits");
  }

  return errors;
};

FacultySchema.methods.isValidForDepartmentAssignment = function () {
  const errors = this.validateFacultyData();

  if (!this.department) {
    errors.push("Department must be selected for assignment");
  }

  return errors;
};

FacultySchema.methods.canBeAssignedToDepartment = function (departmentId) {
  if (!departmentId) {
    return { valid: false, error: "Department ID is required" };
  }

  if (this.department && this.department.toString() === departmentId) {
    return {
      valid: false,
      error: "Faculty is already assigned to this department",
    };
  }

  return { valid: true, error: null };
};

FacultySchema.methods.assignToDepartment = function (departmentId) {
  const validation = this.canBeAssignedToDepartment(departmentId);

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  this.department = departmentId;
  return this;
};

FacultySchema.methods.checkDuplicateAssignment = async function (departmentId) {
  const existing = await mongoose.model("Faculty").findOne({
    _id: { $ne: this._id },
    email: this.email,
    department: departmentId,
  });

  return !!existing;
};

module.exports = mongoose.model("Faculty", FacultySchema);
