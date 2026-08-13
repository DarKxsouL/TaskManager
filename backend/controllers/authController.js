// const User = require('../models/User');
// const Room = require('../models/Room');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const PasswordResetToken = require('../models/PasswordResetToken');
// // const { generateOTP, mailTransport } = require('../utils/mail');
// const { generateOTP, sendOTPEmail, sendPasswordChangedEmail } = require('../utils/mail');

// // --- HELPER: JWT GENERATOR ---
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: '7d',
//   });
// };

// // --- HELPER: COOKIE OPTIONS (CRITICAL FOR VERCEL/RENDER) ---
// const getCookieOptions = () => {
//   // Check if we are in production (Render sets NODE_ENV to 'production' by default)
//   const isProduction = process.env.NODE_ENV === 'production';

//   return {
//     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
//     httpOnly: true, // Security: JS cannot access this
    
//     // IF PRODUCTION (Render): Secure=true, SameSite=None (Required for Cross-Site)
//     // IF DEV (Localhost): Secure=false, SameSite=Lax (Standard)
//     secure: isProduction ? true : false, 
//     sameSite: isProduction ? 'None' : 'Lax',
//   };
// };

// // --- REGISTER USER ---
// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, systemRole, companyName } = req.body;

//     const userExists = await User.findOne({ email: email.toLowerCase() });
//     if (userExists) return res.status(400).json({ message: 'User already exists' });

//     if (systemRole === 'Admin' && !companyName) {
//       return res.status(400).json({ message: 'Company name is required for Admin registration' });
//     }

//     // Enforce Single Admin Rule
//     // if (systemRole === 'Admin') {
//     //     const adminCount = await User.countDocuments({ role: 'Admin' });
//     //     if (adminCount > 0) {
//     //         return res.status(403).json({ message: 'Admin already exists! Only one admin is allowed.' });
//     //     }
//     // }

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const user = await User.create({
//       name,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role: systemRole || 'Employee',
//       jobRole: 'N/A',
//       designation: systemRole === 'Admin' ? 'Admin' : 'Employee',
//       roomId: null,           // will be updated below for admin
//       roomStatus: systemRole === 'Admin' ? 'approved' : 'none'
//     });


//     if (systemRole === 'Admin') {
//       const newRoom = await Room.create({
//         adminId: user._id,    // real _id, no placeholder needed
//         name: companyName
//       });

//       // 3. Update user with the generated roomId
//       user.roomId = newRoom.roomId;
//       await user.save();
//     }

//     // Create the user
//     // const user = await User.create({
//     //   name,
//     //   email: email.toLowerCase(),
//     //   password: hashedPassword,
//     //   role: systemRole || 'Employee',
//     //   jobRole: 'N/A',
//     //   designation: systemRole === 'Admin' ? 'Admin' : 'Employee',
//     //   roomId,
//     //   roomStatus
//     // });

//     // If Admin — update the room's adminId now that we have the user's _id
//     // if (systemRole === 'Admin') {
//     //   await Room.findOneAndUpdate(
//     //     { roomId },
//     //     { adminId: user._id }
//     //   );
//     // }

//     const token = generateToken(user._id);

//     // USE HELPER FOR COOKIE OPTIONS
//     res.cookie('token', token, getCookieOptions());

//     res.status(201).json({
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         roomId: user.roomId,
//         roomStatus: user.roomStatus
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- LOGIN USER ---
// exports.login = async (req, res) => {
//   try {
//     const { email, password, loginAs } = req.body;

//     const user = await User.findOne({ email: email.toLowerCase() });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });


// if (loginAs) {
//   const isAdminAttempt = loginAs === 'Admin';
//   const isAdminAccount = user.role === 'Admin' || user.role === 'CEO';

//   if (isAdminAttempt && !isAdminAccount) {
//     return res.status(403).json({ message: "Access denied. You are not an Admin." });
//   }
//   if (!isAdminAttempt && isAdminAccount) {
//     return res.status(403).json({ message: "Admins must use the Admin login." });
//   }
// }


//     const token = generateToken(user._id);

//     // USE HELPER FOR COOKIE OPTIONS
//     res.cookie('token', token, getCookieOptions());

//     res.json({
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         roomId: user.roomId,
//         roomStatus: user.roomStatus
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- LOGOUT USER ---
// exports.logout = (req, res) => {
//   res.cookie('token', '', {
//     ...getCookieOptions(), // Spread the same security options
//     expires: new Date(0)   // Expire immediately
//   });
//   res.json({ message: 'Logged out successfully' });
// };

// // --- GET CURRENT USER ---
// exports.getMe = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password'); 
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- FORGOT PASSWORD ---
// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ message: "Email is required" });

//   const user = await User.findOne({ email });
//   if (!user) return res.status(404).json({ message: "User not found" });

//   await PasswordResetToken.findOneAndDelete({ owner: user._id });

//   const otp = generateOTP();

//   const resetToken = new PasswordResetToken({
//     owner: user._id,
//     token: otp
//   });
//   await resetToken.save();

//   // await mailTransport.sendMail({
//   //   from: 'security@yourapp.com',
//   //   to: user.email,
//   //   subject: 'Password Reset OTP',
//   //   html: `<h1>Your OTP is: ${otp}</h1><p>This code is valid for 5 minutes.</p>`
//   // });
//   await sendOTPEmail(user.email, otp);


//   res.json({ message: "OTP sent to your email." });
// };

// // --- RESET PASSWORD ---
// exports.resetPassword = async (req, res) => {
//   try {
//       const { email, otp, newPassword } = req.body;
      
//       if (!email || !otp || !newPassword) 
//         return res.status(400).json({ message: "All fields are required" });

//       const user = await User.findOne({ email });
//       if (!user) return res.status(404).json({ message: "User not found" });

//       const resetToken = await PasswordResetToken.findOne({ owner: user._id });
//       if (!resetToken) return res.status(400).json({ message: "OTP expired or invalid" });

//       const isValid = await resetToken.compareToken(otp);
//       if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(newPassword, salt);
      
//       user.password = hashedPassword; 
//       await user.save();

//       await PasswordResetToken.findByIdAndDelete(resetToken._id);

//       // await mailTransport.sendMail({
//       //   from: 'security@yourapp.com',
//       //   to: user.email,
//       //   subject: 'Password Reset Successful',
//       //   html: `<h1>Password Updated</h1><p>You can now login with your new password.</p>`
//       // });
//       await sendPasswordChangedEmail(user.email);

//       res.json({ message: "Password reset successful" });
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// };




const User = require('../models/User');
const Room = require('../models/Room');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PasswordResetToken = require('../models/PasswordResetToken');
// const { generateOTP, mailTransport } = require('../utils/mail');
const { generateOTP, sendOTPEmail, sendPasswordChangedEmail } = require('../utils/mail');
const { notifyUser } = require('../utils/notifications');

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
    const { name, email, password, systemRole, companyName } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    if (systemRole === 'Admin' && !companyName) {
      return res.status(400).json({ message: 'Company name is required for Admin registration' });
    }

    // Enforce Single Admin Rule
    // if (systemRole === 'Admin') {
    //     const adminCount = await User.countDocuments({ role: 'Admin' });
    //     if (adminCount > 0) {
    //         return res.status(403).json({ message: 'Admin already exists! Only one admin is allowed.' });
    //     }
    // }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: systemRole || 'Employee',
      jobRole: 'N/A',
      designation: systemRole === 'Admin' ? 'Admin' : 'Employee',
      roomId: null,           // will be updated below for admin
      roomStatus: systemRole === 'Admin' ? 'approved' : 'none'
    });


    if (systemRole === 'Admin') {
      const newRoom = await Room.create({
        adminId: user._id,    // real _id, no placeholder needed
        name: companyName
      });

      // 3. Update user with the generated roomId
      user.roomId = newRoom.roomId;
      await user.save();
    }

    // Create the user
    // const user = await User.create({
    //   name,
    //   email: email.toLowerCase(),
    //   password: hashedPassword,
    //   role: systemRole || 'Employee',
    //   jobRole: 'N/A',
    //   designation: systemRole === 'Admin' ? 'Admin' : 'Employee',
    //   roomId,
    //   roomStatus
    // });

    // If Admin — update the room's adminId now that we have the user's _id
    // if (systemRole === 'Admin') {
    //   await Room.findOneAndUpdate(
    //     { roomId },
    //     { adminId: user._id }
    //   );
    // }

    const token = generateToken(user._id);

    // USE HELPER FOR COOKIE OPTIONS
    res.cookie('token', token, getCookieOptions());

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomId: user.roomId,
        roomStatus: user.roomStatus
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- LOGIN USER ---
exports.login = async (req, res) => {
  try {
    const { email, password, loginAs } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });


if (loginAs) {
  const isAdminAttempt = loginAs === 'Admin';
  const isAdminAccount = user.role === 'Admin' || user.role === 'CEO';

  if (isAdminAttempt && !isAdminAccount) {
    return res.status(403).json({ message: "Access denied. You are not an Admin." });
  }
  if (!isAdminAttempt && isAdminAccount) {
    return res.status(403).json({ message: "Admins must use the Admin login." });
  }
}


    const token = generateToken(user._id);

    // USE HELPER FOR COOKIE OPTIONS
    res.cookie('token', token, getCookieOptions());

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomId: user.roomId,
        roomStatus: user.roomStatus
      }
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

  // await mailTransport.sendMail({
  //   from: 'security@yourapp.com',
  //   to: user.email,
  //   subject: 'Password Reset OTP',
  //   html: `<h1>Your OTP is: ${otp}</h1><p>This code is valid for 5 minutes.</p>`
  // });
  await sendOTPEmail(user.email, otp);

  // In-app notification mirrors the email — mostly a security trail so the
  // user has a record inside the app of "someone requested a reset" even if
  // they read it after the 5-minute OTP window has already expired.
  await notifyUser(req.io, {
    recipient: user._id,
    roomId: user.roomId,
    type: 'PASSWORD_RESET_REQUESTED',
    message: 'A password reset was requested for your account.',
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

      // await mailTransport.sendMail({
      //   from: 'security@yourapp.com',
      //   to: user.email,
      //   subject: 'Password Reset Successful',
      //   html: `<h1>Password Updated</h1><p>You can now login with your new password.</p>`
      // });
      await sendPasswordChangedEmail(user.email);

      await notifyUser(req.io, {
        recipient: user._id,
        roomId: user.roomId,
        type: 'PASSWORD_CHANGED',
        message: 'Your password was changed successfully.',
      });

      res.json({ message: "Password reset successful" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};