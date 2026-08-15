// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const { getUserProfile, updateUserProfile } = require('../controllers/userController');
// const { protect } = require('../middleware/authMiddleware');

// // --- 1. PROFILE ROUTES ---
// router.get('/profile', protect, getUserProfile);
// router.put('/profile', protect, updateUserProfile);

// // --- 2. GENERAL ROUTES ---
// router.get('/', protect, async (req, res) => {
//   try {
//     const users = await User.find().select('-password');
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.post('/', protect, async (req, res) => {
//   // Admin creating a new user
//   const user = new User({
//     name: req.body.name,
//     email: req.body.email.toLowerCase(), 
//     role: req.body.role || 'Employee',
//     designation: req.body.designation || 'New Hire',
//     mobile: req.body.mobile || '',
//     jobRole: req.body.jobRole || ''
//   });
//   try {
//     const newUser = await user.save();
//     res.status(201).json(newUser);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // --- 3. SPECIFIC ID ROUTES ---

// // ✅ THIS IS THE ROUTE YOU WERE MISSING FOR PROMOTING ADMINS
// router.patch('/:id/role', protect, async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         // Update the System Role (Admin/Employee)
//         if (req.body.role) {
//             user.role = req.body.role;
//         }
//         await user.save();
//         res.json(user);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// // Update Job Details (Designation/Job Role)
// router.patch('/:id', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     if (req.body.jobRole !== undefined) user.jobRole = req.body.jobRole;
//     if (req.body.designation !== undefined) user.designation = req.body.designation;

//     const updatedUser = await user.save();
//     res.json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.delete('/profile', protect, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.user.id);
//     res.cookie('token', '', { expires: new Date(0) });
//     res.json({ message: 'Account deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Delete User
// // router.delete('/:id', protect, async (req, res) => {
// //     try {
// //         await User.findByIdAndDelete(req.params.id);
// //         res.json({ message: "User deleted" });
// //     } catch (err) {
// //         res.status(500).json({ message: err.message });
// //     }
// // });

// module.exports = router;









const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getUserProfile, updateUserProfile, getProfileStats, getUserStats } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/permissionsMiddleware');
const { notifyUser } = require('../utils/notifications');

// --- PROFILE ROUTES ---
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Own performance stats — must be registered before '/:userId/stats' below,
// otherwise Express would match "profile" as the :userId param.
router.get('/profile/stats', protect, getProfileStats);

// Delete own account
router.delete('/profile', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.cookie('token', '', { expires: new Date(0) });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- GET ALL USERS IN SAME ROOM ---
// Only returns approved members of the same room
router.get('/', protect, async (req, res) => {
  try {
    if (!req.user.roomId || req.user.roomStatus !== 'approved') {
      return res.status(403).json({ message: 'You must be in an approved room to view members.' });
    }

    const users = await User.find({
      roomId: req.user.roomId,       // ← same room only
      roomStatus: 'approved'         // ← only approved members
    }).select('-password');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN: CREATE A USER DIRECTLY ---
// Skips the join request flow — admin can directly add someone
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = new User({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      role: req.body.role || 'Employee',
      designation: req.body.designation || 'Employee',
      mobile: req.body.mobile || '',
      jobRole: req.body.jobRole || 'N/A',
      roomId: req.user.roomId,       // ← auto-assign to admin's room
      roomStatus: 'approved'         // ← auto-approved since admin is adding them
    });

    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- ADMIN: UPDATE SYSTEM ROLE ---
router.patch('/:id/role', protect, hasPermission('PROMOTE_MEMBERS'), async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findOne({
      _id: req.params.id,
      roomId: req.user.roomId        // ← must be in same room
    });
    if (!user) return res.status(404).json({ message: 'User not found in your room' });

    const roleChanged = req.body.role && req.body.role !== user.role;

    if (req.body.role) user.role = req.body.role;
    await user.save();

    if (roleChanged) {
      await notifyUser(req.io, {
        recipient: user._id,
        roomId: user.roomId,
        type: 'ROLE_UPDATED',
        message: `Your role was updated to ${user.role}.`,
        link: 'profile',
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/:userId/stats', protect, hasPermission('VIEW_ALL_STATS'), getUserStats);

// --- ADMIN: UPDATE JOB DETAILS ---
router.patch('/:id', protect, hasPermission('ASSIGN_ROLES'), async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findOne({
      _id: req.params.id,
      roomId: req.user.roomId        // ← must be in same room
    });
    if (!user) return res.status(404).json({ message: 'User not found in your room' });

    const jobRoleChanged = req.body.jobRole !== undefined && req.body.jobRole !== user.jobRole;
    const designationChanged = req.body.designation !== undefined && req.body.designation !== user.designation;

    if (req.body.jobRole !== undefined) user.jobRole = req.body.jobRole;
    if (req.body.designation !== undefined) user.designation = req.body.designation;

    const updatedUser = await user.save();

    if (jobRoleChanged || designationChanged) {
      await notifyUser(req.io, {
        recipient: updatedUser._id,
        roomId: updatedUser.roomId,
        type: 'PROFILE_UPDATED',
        message: 'Your job details were updated by an admin.',
        link: 'profile',
      });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ADMIN: DELETE A USER ---
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findOne({
      _id: req.params.id,
      roomId: req.user.roomId        // ← must be in same room
    });
    if (!user) return res.status(404).json({ message: 'User not found in your room' });

    await User.findByIdAndDelete(req.params.id);

    // Same hierarchy cleanup as removeMember — direct children become
    // independent rather than pointing at a deleted user.
    await User.updateMany(
      { roomId: req.user.roomId, hierarchyParent: req.params.id },
      { hierarchyParent: null }
    );
    req.io.to(`room-${req.user.roomId}`).emit('hierarchy-updated');


    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
























// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const { getUserProfile, updateUserProfile, getProfileStats, getUserStats } = require('../controllers/userController');
// const { protect } = require('../middleware/authMiddleware');
// const { hasPermission } = require('../middleware/permissionsMiddleware');

// // --- PROFILE ROUTES ---
// router.get('/profile', protect, getUserProfile);
// router.put('/profile', protect, updateUserProfile);

// // Own performance stats — must be registered before '/:userId/stats' below,
// // otherwise Express would match "profile" as the :userId param.
// router.get('/profile/stats', protect, getProfileStats);

// // Delete own account
// router.delete('/profile', protect, async (req, res) => {
//   try {
//     await User.findByIdAndDelete(req.user.id);
//     res.cookie('token', '', { expires: new Date(0) });
//     res.json({ message: 'Account deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // --- GET ALL USERS IN SAME ROOM ---
// // Only returns approved members of the same room
// router.get('/', protect, async (req, res) => {
//   try {
//     if (!req.user.roomId || req.user.roomStatus !== 'approved') {
//       return res.status(403).json({ message: 'You must be in an approved room to view members.' });
//     }

//     const users = await User.find({
//       roomId: req.user.roomId,       // ← same room only
//       roomStatus: 'approved'         // ← only approved members
//     }).select('-password');

//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // --- ADMIN: CREATE A USER DIRECTLY ---
// // Skips the join request flow — admin can directly add someone
// router.post('/', protect, async (req, res) => {
//   try {
//     if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     const user = new User({
//       name: req.body.name,
//       email: req.body.email.toLowerCase(),
//       role: req.body.role || 'Employee',
//       designation: req.body.designation || 'Employee',
//       mobile: req.body.mobile || '',
//       jobRole: req.body.jobRole || 'N/A',
//       roomId: req.user.roomId,       // ← auto-assign to admin's room
//       roomStatus: 'approved'         // ← auto-approved since admin is adding them
//     });

//     const newUser = await user.save();
//     res.status(201).json(newUser);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // --- ADMIN: UPDATE SYSTEM ROLE ---
// router.patch('/:id/role', protect, hasPermission('PROMOTE_MEMBERS'), async (req, res) => {
//   try {
//     if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     const user = await User.findOne({
//       _id: req.params.id,
//       roomId: req.user.roomId        // ← must be in same room
//     });
//     if (!user) return res.status(404).json({ message: 'User not found in your room' });

//     if (req.body.role) user.role = req.body.role;
//     await user.save();

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// router.get('/:userId/stats', protect, hasPermission('VIEW_ALL_STATS'), getUserStats);

// // --- ADMIN: UPDATE JOB DETAILS ---
// router.patch('/:id', protect, hasPermission('ASSIGN_ROLES'), async (req, res) => {
//   try {
//     if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     const user = await User.findOne({
//       _id: req.params.id,
//       roomId: req.user.roomId        // ← must be in same room
//     });
//     if (!user) return res.status(404).json({ message: 'User not found in your room' });

//     if (req.body.jobRole !== undefined) user.jobRole = req.body.jobRole;
//     if (req.body.designation !== undefined) user.designation = req.body.designation;

//     const updatedUser = await user.save();
//     res.json(updatedUser);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // --- ADMIN: DELETE A USER ---
// router.delete('/:id', protect, async (req, res) => {
//   try {
//     if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     const user = await User.findOne({
//       _id: req.params.id,
//       roomId: req.user.roomId        // ← must be in same room
//     });
//     if (!user) return res.status(404).json({ message: 'User not found in your room' });

//     await User.findByIdAndDelete(req.params.id);
//     res.json({ message: 'User deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// module.exports = router;