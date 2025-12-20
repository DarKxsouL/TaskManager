// const express = require('express');
// const router = express.Router();
// const { register, login, logout, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
// const { protect } = require('../middleware/authMiddleware');


// router.post('/register', register);
// router.post('/login', login);
// router.post('/logout', logout);
// router.get('/me', protect, getMe);


// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);

// module.exports = router;


const express = require('express');
const router = express.Router();

// Import Controller
const authController = require('../controllers/authController');

// --- DEBUGGING LOGS ---
// This will print in your VS Code Terminal (Backend) when you save/restart
console.log("------------------------------------------");
console.log("Checking Auth Controller Imports:");
console.log("1. ForgotPassword Function:", typeof authController.forgotPassword);
console.log("2. ResetPassword Function:", typeof authController.resetPassword);
console.log("------------------------------------------");
// ----------------------

const { register, login, logout, getMe, forgotPassword, resetPassword } = authController;
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// The new routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;