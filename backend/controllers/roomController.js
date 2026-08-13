// const Room = require('../models/Room');
// const User = require('../models/User');
// const Settings = require('../models/Settings');
// const { PERMISSIONS } = require('../middleware/permissionsMiddleware');

// // --- GET MY ROOM INFO ---
// // Used by admin to see their room details (roomId to share, room name)
// exports.getMyRoom = async (req, res) => {
//   try {
//     const room = await Room.findOne({ roomId: req.user.roomId });
//     if (!room) return res.status(404).json({ message: 'Room not found' });

//     res.json(room);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- REQUEST TO JOIN A ROOM ---
// // Employee submits a roomId → status set to pending
// exports.requestJoin = async (req, res) => {
//   try {
//     const { roomId } = req.body;

//     if (!roomId) return res.status(400).json({ message: 'Room ID is required' });

//     // 1. Check user isn't already in a room
//     if (req.user.roomStatus === 'approved') {
//       return res.status(400).json({ message: 'You are already a member of a room' });
//     }

//     if (req.user.roomStatus === 'pending') {
//       return res.status(400).json({ message: 'You already have a pending request. Please wait for admin approval.' });
//     }

//     // 2. Verify the room exists
//     const room = await Room.findOne({ roomId });
//     if (!room) return res.status(404).json({ message: 'Invalid Room ID. Please check and try again.' });

//     // 3. Update user's roomId and status
//     await User.findByIdAndUpdate(req.user._id, {
//       roomId,
//       roomStatus: 'pending'
//     });

//     // 4. Notify admin via socket (if online)
//     req.io.emit(`room-request-${roomId}`, {
//       message: `${req.user.name} has requested to join your room.`,
//       userId: req.user._id,
//       userName: req.user.name,
//       userEmail: req.user.email
//     });

//     res.json({ message: 'Join request sent. Please wait for admin approval.' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- GET PENDING REQUESTS ---
// // Admin sees all users with roomStatus: pending for their room
// exports.getPendingRequests = async (req, res) => {
//   try {
//     // Only admins can see requests
//     if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     const pendingUsers = await User.find({
//       roomId: req.user.roomId,
//       roomStatus: 'pending'
//     }).select('-password');

//     res.json(pendingUsers);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- APPROVE A MEMBER ---
// // Admin approves a pending user → roomStatus set to approved
// exports.approveMember = async (req, res) => {
//   try {
//     // Only admins can approve
//     if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     const { userId } = req.params;

//     const targetUser = await User.findById(userId);
//     if (!targetUser) return res.status(404).json({ message: 'User not found' });

//     // Make sure the request is for THIS admin's room
//     if (targetUser.roomId !== req.user.roomId) {
//       return res.status(403).json({ message: 'This user did not request to join your room' });
//     }

//     if (targetUser.roomStatus !== 'pending') {
//       return res.status(400).json({ message: 'No pending request from this user' });
//     }

//     await User.findByIdAndUpdate(userId, { roomStatus: 'approved' });

//     // Notify the employee via socket (if online)
//     req.io.emit(`room-approved-${userId}`, {
//       message: 'Your request to join the room has been approved!',
//       roomId: req.user.roomId
//     });

//     res.json({ message: `${targetUser.name} has been approved and added to your room.` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- REJECT A MEMBER ---
// // Admin rejects a pending user → roomId and roomStatus reset
// exports.rejectMember = async (req, res) => {
//   try {
//     // Only admins can reject
//     if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     const { userId } = req.params;

//     const targetUser = await User.findById(userId);
//     if (!targetUser) return res.status(404).json({ message: 'User not found' });

//     if (targetUser.roomId !== req.user.roomId) {
//       return res.status(403).json({ message: 'This user did not request to join your room' });
//     }

//     if (targetUser.roomStatus !== 'pending') {
//       return res.status(400).json({ message: 'No pending request from this user' });
//     }

//     // Reset the user back to no room
//     await User.findByIdAndUpdate(userId, {
//       roomId: null,
//       roomStatus: 'none'
//     });

//     // Notify the employee via socket (if online)
//     req.io.emit(`room-rejected-${userId}`, {
//       message: 'Your request to join the room was declined.'
//     });

//     res.json({ message: `${targetUser.name}'s request has been rejected.` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- REMOVE A MEMBER ---
// // Admin removes an already-approved member from their room
// exports.removeMember = async (req, res) => {
//   try {
//     if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     const { userId } = req.params;

//     const targetUser = await User.findById(userId);
//     if (!targetUser) return res.status(404).json({ message: 'User not found' });

//     if (targetUser.roomId !== req.user.roomId) {
//       return res.status(403).json({ message: 'This user is not in your room' });
//     }

//     // Cannot remove yourself (admin)
//     if (targetUser._id.toString() === req.user._id.toString()) {
//       return res.status(400).json({ message: 'You cannot remove yourself from the room' });
//     }

//     await User.findByIdAndUpdate(userId, {
//       roomId: null,
//       roomStatus: 'none'
//     });

//     req.io.emit(`room-removed-${userId}`, {
//       message: 'You have been removed from the room.'
//     });

//     res.json({ message: `${targetUser.name} has been removed from your room.` });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // --- GET ALL AVAILABLE PERMISSIONS ---
// // Frontend uses this to render the checkboxes dynamically
// exports.getPermissions = async (req, res) => {
//   res.json({ permissions: PERMISSIONS });
// };

// // --- SET MEMBER PERMISSIONS ---
// // Admin sets the full permissions array for a specific employee
// exports.setMemberPermissions = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { permissions } = req.body;

//     console.log('Setting permissions:', { userId, permissions });

//     // Validate — every key must be a known permission
//     const invalid = permissions.filter(p => !PERMISSIONS.includes(p));
//     if (invalid.length > 0) {
//       return res.status(400).json({ 
//         message: `Unknown permissions: ${invalid.join(', ')}` 
//       });
//     }

//     // Target must be in same room
//     const targetUser = await User.findOne({ 
//       _id: userId, 
//       roomId: req.user.roomId 
//     });
//     if (!targetUser) {
//       return res.status(404).json({ message: 'User not found in your room' });
//     }

//     // Cannot set permissions on another Admin — only Employees
//     if (targetUser.role === 'Admin') {
//       return res.status(400).json({ 
//         message: 'Admins already have full access. Permissions only apply to Employees.' 
//       });
//     }

//     const updated = await User.findByIdAndUpdate(
//       userId, 
//       { $set: { permissions } },  // ← explicit $set to replace the whole array
//       { new: true }               // ← return updated document
//     ).select('-password');

//     console.log('Updated permissions:', updated.permissions);

//     res.json({ 
//       message: `Permissions updated for ${targetUser.name}.`,
//       permissions 
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


const Room = require('../models/Room');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { PERMISSIONS } = require('../middleware/permissionsMiddleware');
const { notifyUser, notifyUsers } = require('../utils/notifications');

// Small helper — every admin/CEO currently approved in a room. Used any time
// we need to notify "the admins" rather than one specific person.
const getRoomAdmins = (roomId) =>
  User.find({ roomId, roomStatus: 'approved', role: { $in: ['Admin', 'CEO'] } }).select('_id');

// --- GET MY ROOM INFO ---
// Used by admin to see their room details (roomId to share, room name)
exports.getMyRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.user.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- REQUEST TO JOIN A ROOM ---
// Employee submits a roomId → status set to pending
exports.requestJoin = async (req, res) => {
  try {
    const { roomId } = req.body;

    if (!roomId) return res.status(400).json({ message: 'Room ID is required' });

    // 1. Check user isn't already in a room
    if (req.user.roomStatus === 'approved') {
      return res.status(400).json({ message: 'You are already a member of a room' });
    }

    if (req.user.roomStatus === 'pending') {
      return res.status(400).json({ message: 'You already have a pending request. Please wait for admin approval.' });
    }

    // 2. Verify the room exists
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: 'Invalid Room ID. Please check and try again.' });

    // 3. Update user's roomId and status
    await User.findByIdAndUpdate(req.user._id, {
      roomId,
      roomStatus: 'pending'
    });

    // 4. Notify admin via socket (if online) — legacy broadcast, left as-is
    req.io.emit(`room-request-${roomId}`, {
      message: `${req.user.name} has requested to join your room.`,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email
    });

    // 5. Persisted notification for every admin of that room, so it shows
    // up in their bell even if they weren't online for the broadcast above.
    const admins = await getRoomAdmins(roomId);
    await notifyUsers(req.io, admins.map(a => a._id), {
      roomId,
      type: 'ROOM_JOIN_REQUEST',
      message: `${req.user.name} requested to join your room.`,
      link: 'settings',
      relatedId: req.user._id,
    });

    res.json({ message: 'Join request sent. Please wait for admin approval.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET PENDING REQUESTS ---
// Admin sees all users with roomStatus: pending for their room
exports.getPendingRequests = async (req, res) => {
  try {
    // Only admins can see requests
    if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const pendingUsers = await User.find({
      roomId: req.user.roomId,
      roomStatus: 'pending'
    }).select('-password');

    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- APPROVE A MEMBER ---
// Admin approves a pending user → roomStatus set to approved
exports.approveMember = async (req, res) => {
  try {
    // Only admins can approve
    if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Make sure the request is for THIS admin's room
    if (targetUser.roomId !== req.user.roomId) {
      return res.status(403).json({ message: 'This user did not request to join your room' });
    }

    if (targetUser.roomStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending request from this user' });
    }

    await User.findByIdAndUpdate(userId, { roomStatus: 'approved' });

    // Notify the employee via socket (if online) — this specific event name
    // is what JoinRoom.tsx / SocketManager.tsx listen for to refresh the
    // session and unlock the dashboard, so it stays exactly as-is.
    req.io.emit(`room-approved-${userId}`, {
      message: 'Your request to join the room has been approved!',
      roomId: req.user.roomId
    });

    // Persisted notification for the approved user
    await notifyUser(req.io, {
      recipient: userId,
      roomId: req.user.roomId,
      type: 'ROOM_JOIN_APPROVED',
      message: 'Your request to join the room has been approved!',
      link: 'assigned',
    });

    // Let the rest of the admin team know someone new joined (skip the
    // admin who just clicked approve — they already know).
    const otherAdmins = (await getRoomAdmins(req.user.roomId))
      .map(a => a._id.toString())
      .filter(id => id !== req.user._id.toString());

    await notifyUsers(req.io, otherAdmins, {
      roomId: req.user.roomId,
      type: 'ROOM_NEW_MEMBER',
      message: `${targetUser.name} joined the room.`,
      link: 'network',
      relatedId: targetUser._id,
    });

    res.json({ message: `${targetUser.name} has been approved and added to your room.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- REJECT A MEMBER ---
// Admin rejects a pending user → roomId and roomStatus reset
exports.rejectMember = async (req, res) => {
  try {
    // Only admins can reject
    if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (targetUser.roomId !== req.user.roomId) {
      return res.status(403).json({ message: 'This user did not request to join your room' });
    }

    if (targetUser.roomStatus !== 'pending') {
      return res.status(400).json({ message: 'No pending request from this user' });
    }

    // Snapshot before we reset it below — the notification should still
    // record which room the request was for.
    const roomIdAtRejection = targetUser.roomId;

    // Reset the user back to no room
    await User.findByIdAndUpdate(userId, {
      roomId: null,
      roomStatus: 'none'
    });

    // Notify the employee via socket (if online) — kept exactly as-is,
    // JoinRoom.tsx / SocketManager.tsx depend on this event name.
    req.io.emit(`room-rejected-${userId}`, {
      message: 'Your request to join the room was declined.'
    });

    await notifyUser(req.io, {
      recipient: userId,
      roomId: roomIdAtRejection,
      type: 'ROOM_JOIN_REJECTED',
      message: 'Your request to join the room was declined.',
    });

    res.json({ message: `${targetUser.name}'s request has been rejected.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- REMOVE A MEMBER ---
// Admin removes an already-approved member from their room
exports.removeMember = async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'CEO') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.params;

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    if (targetUser.roomId !== req.user.roomId) {
      return res.status(403).json({ message: 'This user is not in your room' });
    }

    // Cannot remove yourself (admin)
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot remove yourself from the room' });
    }

    const roomIdAtRemoval = targetUser.roomId;

    await User.findByIdAndUpdate(userId, {
      roomId: null,
      roomStatus: 'none'
    });

    req.io.emit(`room-removed-${userId}`, {
      message: 'You have been removed from the room.'
    });

    await notifyUser(req.io, {
      recipient: userId,
      roomId: roomIdAtRemoval,
      type: 'ROOM_MEMBER_REMOVED',
      message: 'You have been removed from the room.',
    });

    res.json({ message: `${targetUser.name} has been removed from your room.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET ALL AVAILABLE PERMISSIONS ---
// Frontend uses this to render the checkboxes dynamically
exports.getPermissions = async (req, res) => {
  res.json({ permissions: PERMISSIONS });
};

// --- SET MEMBER PERMISSIONS ---
// Admin sets the full permissions array for a specific employee
exports.setMemberPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    console.log('Setting permissions:', { userId, permissions });

    // Validate — every key must be a known permission
    const invalid = permissions.filter(p => !PERMISSIONS.includes(p));
    if (invalid.length > 0) {
      return res.status(400).json({ 
        message: `Unknown permissions: ${invalid.join(', ')}` 
      });
    }

    // Target must be in same room
    const targetUser = await User.findOne({ 
      _id: userId, 
      roomId: req.user.roomId 
    });
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found in your room' });
    }

    // Cannot set permissions on another Admin — only Employees
    if (targetUser.role === 'Admin') {
      return res.status(400).json({ 
        message: 'Admins already have full access. Permissions only apply to Employees.' 
      });
    }

    const updated = await User.findByIdAndUpdate(
      userId, 
      { $set: { permissions } },  // ← explicit $set to replace the whole array
      { new: true }               // ← return updated document
    ).select('-password');

    console.log('Updated permissions:', updated.permissions);

    await notifyUser(req.io, {
      recipient: userId,
      roomId: req.user.roomId,
      type: 'PERMISSIONS_UPDATED',
      message: 'Your permissions were updated by an admin.',
      link: 'profile',
    });

    res.json({ 
      message: `Permissions updated for ${targetUser.name}.`,
      permissions 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};