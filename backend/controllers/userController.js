const User = require('../models/User');

// Get Current User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Current User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.mobile = req.body.mobile || user.mobile;
    user.designation = req.body.designation || user.designation;
    // Note: We typically do not allow changing Email or Role here for security

    const updatedUser = await user.save();
    
    // Return updated user without password
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      designation: updatedUser.designation,
      mobile: updatedUser.mobile
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};