const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { generateOTP, mailTransport } = require('../utils/mail');

// --- HELPER: JWT GENERATOR ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// --- HELPER: COOKIE OPTIONS (CRITICAL FOR VERCEL/RENDER) ---
const getCookieOptions = () => {
  // Check if we are in production (Render sets NODE_ENV to 'production' by default)
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Security: JS cannot access this
    
    // IF PRODUCTION (Render): Secure=true, SameSite=None (Required for Cross-Site)
    // IF DEV (Localhost): Secure=false, SameSite=Lax (Standard)
    secure: isProduction ? true : false, 
    sameSite: isProduction ? 'None' : 'Lax',
  };
};

// --- REGISTER USER ---
exports.register = async (req, res) => {
  try {
    const { name, email, password, systemRole } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Enforce Single Admin Rule
    if (systemRole === 'Admin') {
        const adminCount = await User.countDocuments({ role: 'Admin' });
        if (adminCount > 0) {
            return res.status(403).json({ message: 'Admin already exists! Only one admin is allowed.' });
        }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: systemRole || 'Employee',
      jobRole: 'N/A',
      designation: 'Employee'
    });

    const token = generateToken(user._id);

    // USE HELPER FOR COOKIE OPTIONS
    res.cookie('token', token, getCookieOptions());

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

// --- LOGIN USER ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);

    // USE HELPER FOR COOKIE OPTIONS
    res.cookie('token', token, getCookieOptions());

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

// --- LOGOUT USER ---
exports.logout = (req, res) => {
  res.cookie('token', '', {
    ...getCookieOptions(), // Spread the same security options
    expires: new Date(0)   // Expire immediately
  });
  res.json({ message: 'Logged out successfully' });
};

// --- GET CURRENT USER ---
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); 
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- FORGOT PASSWORD ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  const otp = generateOTP();

  const resetToken = new PasswordResetToken({
    owner: user._id,
    token: otp
  });
  await resetToken.save();

  await mailTransport.sendMail({
    from: 'security@yourapp.com',
    to: user.email,
    subject: 'Password Reset OTP',
    html: `<h1>Your OTP is: ${otp}</h1><p>This code is valid for 5 minutes.</p>`
  });

  res.json({ message: "OTP sent to your email." });
};

// --- RESET PASSWORD ---
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

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      user.password = hashedPassword; 
      await user.save();

      await PasswordResetToken.findByIdAndDelete(resetToken._id);

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