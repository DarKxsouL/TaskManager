const mongoose = require('mongoose');

// All notification categories the app currently generates. Keeping this as
// an enum (rather than a free string) means a typo in a controller fails
// loudly at save-time instead of silently producing an un-filterable type.
const NOTIFICATION_TYPES = [
  'TASK_ASSIGNED',
  'TASK_REASSIGNED',
  'TASK_UPDATED',
  'TASK_COMPLETED',
  'TASK_REOPENED',
  'TASK_DELETED',
  'TASK_DUE_TODAY',
  'TASK_OVERDUE',
  'ROOM_JOIN_REQUEST',
  'ROOM_JOIN_APPROVED',
  'ROOM_JOIN_REJECTED',
  'ROOM_MEMBER_REMOVED',
  'ROOM_NEW_MEMBER',
  'PERMISSIONS_UPDATED',
  'ROLE_UPDATED',
  'PROFILE_UPDATED',
  'PASSWORD_CHANGED',
  'PASSWORD_RESET_REQUESTED',
];

// 'link' is a page-key, not a literal path. Routes on the frontend are
// prefixed with the logged-in user's /:username, which the backend has no
// business knowing about — so it just says *which* page a notification
// points to, and the frontend resolves the real path.
const LINK_TARGETS = ['assigned', 'created', 'overdue', 'network', 'settings', 'profile', 'history', null];

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // Not required — a couple of notification types (password changed, OTP
  // requested) can fire for a user who isn't in a room yet.
  roomId: {
    type: String,
    default: null,
    index: true,
  },
  type: {
    type: String,
    enum: NOTIFICATION_TYPES,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    enum: LINK_TARGETS,
    default: null,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Newest-first per-user is the only access pattern the app needs.
NotificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;