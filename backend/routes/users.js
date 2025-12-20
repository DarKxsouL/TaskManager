const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// --- 1. PROFILE ROUTES ---
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// --- 2. GENERAL ROUTES ---
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  // Admin creating a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email.toLowerCase(), 
    role: req.body.role || 'Employee',
    designation: req.body.designation || 'New Hire',
    mobile: req.body.mobile || '',
    jobRole: req.body.jobRole || ''
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- 3. SPECIFIC ID ROUTES ---

// ✅ THIS IS THE ROUTE YOU WERE MISSING FOR PROMOTING ADMINS
router.patch('/:id/role', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update the System Role (Admin/Employee)
        if (req.body.role) {
            user.role = req.body.role;
        }
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Job Details (Designation/Job Role)
router.patch('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.jobRole !== undefined) user.jobRole = req.body.jobRole;
    if (req.body.designation !== undefined) user.designation = req.body.designation;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete User
router.delete('/:id', protect, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;