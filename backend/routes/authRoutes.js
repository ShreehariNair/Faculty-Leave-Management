const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const LeaveBalance = require("../models/leaveBalanceModel");
const { protect } = require("../middleware/auth");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

router.post("/create-user", protect, async (req, res) => {
  try {
    const created = await User.createByAdmin(req.user, req.body);

    // create leave balance record for any staff account
    await LeaveBalance.create({ faculty: created._id });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: created._id,
        name: created.name,
        email: created.email,
        role: created.role,
        department: created.department,
        program: created.program,
        designation: created.designation,
        phone: created.phone,
        subjects: created.subjects,
        avatar: created.avatar,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        program: user.program,
        designation: user.designation,
        phone: user.phone,
        subjects: user.subjects,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    }
    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  return res.json(user);
});

module.exports = router;
