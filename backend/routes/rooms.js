const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getMyRoom,
  requestJoin,
  getPendingRequests,
  approveMember,
  rejectMember,
  removeMember,
  getPermissions,
  setMemberPermissions
} = require('../controllers/roomController');

const { hasPermission } = require('../middleware/permissionsMiddleware')

// Get current user's room info
router.get('/my-room', protect, getMyRoom);

// Employee: request to join a room
router.post('/request', protect, requestJoin);

// see all pending requests for their room
router.get('/requests', protect, hasPermission('APPROVE_MEMBERS'), getPendingRequests);

// approve a pending member
router.patch('/requests/:userId/approve', protect, hasPermission('APPROVE_MEMBERS'), approveMember);

// reject a pending member
router.patch('/requests/:userId/reject', protect, hasPermission('APPROVE_MEMBERS'), rejectMember);

// remove an already approved member
router.patch('/members/:userId/remove', protect, hasPermission('REMOVE_MEMBERS'), removeMember);

// Permission management
router.get('/permissions', protect, getPermissions);
router.patch('/members/:userId/permissions', protect, setMemberPermissions);

module.exports = router;