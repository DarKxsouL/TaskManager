const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { generateOTP, mailTransport } = require('../utils/mail');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d', // Token lasts for 7 days
  });
};

// REGISTER USER
exports.register = async (req, res) => {
  try {
    // 1. UPDATED DESTRUCTURING: We now look for 'systemRole' explicitly
    const { name, email, password, systemRole } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // 2. NEW: ENFORCE ONE ADMIN RULE
    // If someone tries to register as 'Admin', check if one already exists
    if (systemRole === 'Admin') {
        const adminCount = await User.countDocuments({ role: 'Admin' });
        if (adminCount > 0) {
            return res.status(403).json({ message: 'Admin already exists! Only one admin is allowed in the network.' });
        }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. UPDATED CREATE LOGIC
    // We map 'systemRole' (from form) to 'role' (in DB for permissions).
    // We set defaults for jobRole and designation until Admin sets them in Settings.
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: systemRole || 'Employee', // Sets System Permission (Admin vs Employee)
      jobRole: 'N/A',                 // Default placeholder
      designation: 'Employee'         // Default placeholder
    });

    // Generate Token
    const token = generateToken(user._id);

    // Send HTTP-Only Cookie
    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate Token & Cookie
    const token = generateToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGOUT USER
exports.logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
};

// GET CURRENT USER (Session Check)
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the middleware
    const user = await User.findById(req.user.id).select('-password'); 
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Check if a token already exists for this user and remove it (prevent spam)
  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  // Generate OTP
  const otp = generateOTP();

  // Save Hash to DB
  const resetToken = new PasswordResetToken({
    owner: user._id,
    token: otp
  });
  await resetToken.save();

  // Send Plain OTP to Email
  await mailTransport.sendMail({
    from: 'security@yourapp.com',
    to: user.email,
    subject: 'Password Reset OTP',
    html: `<h1>Your OTP is: ${otp}</h1><p>This code is valid for 5 minutes.</p>`
  });

  res.json({ message: "OTP sent to your email." });
};

// --- 2. RESET PASSWORD ---
// --- 2. RESET PASSWORD ---
exports.resetPassword = async (req, res) => {
  try {
      const { email, otp, newPassword } = req.body;
      
      if (!email || !otp || !newPassword) 
        return res.status(400).json({ message: "All fields are required" });

      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });

      const resetToken = await PasswordResetToken.findOne({ owner: user._id });
      if (!resetToken) return res.status(400).json({ message: "OTP expired or invalid" });

      const isValid = await resetToken.compareToken(otp);
      if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

      // FIX: Manually hash the password to be safe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      user.password = hashedPassword; 
      await user.save();

      // Clean up used token
      await PasswordResetToken.findByIdAndDelete(resetToken._id);

      // Send Success Email
      await mailTransport.sendMail({
        from: 'security@yourapp.com',
        to: user.email,
        subject: 'Password Reset Successful',
        html: `<h1>Password Updated</h1><p>You can now login with your new password.</p>`
      });

      res.json({ message: "Password reset successful" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};