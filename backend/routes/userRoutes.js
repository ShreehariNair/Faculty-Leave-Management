const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const { protect } = require("../middleware/auth");
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/upload");
router.post("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // delete old avatar
    if (user.avatar) {
      const oldPath = path.join(__dirname, "../", user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    return res.json({
      message: "Avatar updated successfully",
      avatar: user.avatar,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/avatar", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.avatar) {
      const filePath = path.join(__dirname, "../", user.avatar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      user.avatar = null;
      await user.save();
    }

    return res.json({ message: "Avatar removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/substitutes", protect, async (req, res) => {
  try {
    // faculty/hod/admin can call, but result is restricted to caller's department
    const users = await User.find({
      department: req.user.department,
      role: "faculty",
      _id: { $ne: req.user._id },
      isAvailable: { $ne: false },
    })
      .select("-password")
      .sort({ name: 1 });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* Admin-only list all */
router.get("/faculty/all", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access required" });

    const { department } = req.query;
    const query = {};
    if (department) query.department = department;

    const users = await User.find(query)
      .select("-password")
      .sort({ department: 1, name: 1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* HOD-only list department */
router.get("/faculty/department", protect, async (req, res) => {
  try {
    if (req.user.role !== "hod")
      return res.status(403).json({ message: "HOD access required" });

    const users = await User.find({ department: req.user.department })
      .select("-password")
      .sort({ name: 1 });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

/* HOD-only allocate subjects using fat model method */
router.put("/:id/subjects", protect, async (req, res) => {
  try {
    const teacher = await User.assignSubjectsByHod(
      req.user,
      req.params.id,
      req.body.subjects,
    );

    return res.json({
      message: "Subjects updated successfully",
      user: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        department: teacher.department,
        program: teacher.program,
        designation: teacher.designation,
        subjects: teacher.subjects,
        avatar: teacher.avatar,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
});

module.exports = router;
