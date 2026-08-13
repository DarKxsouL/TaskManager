const mongoose = require("mongoose");

const PERMISSIONS = [
  'APPROVE_MEMBERS',
  'REMOVE_MEMBERS',
  'PROMOTE_MEMBERS',
  'MANAGE_ROLES',
  'ASSIGN_ROLES',
  'DELETE_ANY_TASK',
  'UPDATE_ANY_TASK',
  'VIEW_ALL_STATS'
];

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, default: "" },

  roomId: { type: String, default: null },
  roomStatus: {
    type: String,
    enum: ["pending", "approved", "none"],
    default: "none",
  },
  
  role: {
    type: String,
    enum: ["Admin", "Employee", "CEO"],
    default: "Employee",
  },

  jobRole: { type: String, default: "N/A" },
  designation: { type: String, default: "Employee" },

  roomId: { 
    type: String, 
    default: null   // null = not in any room yet
  },
  roomStatus: { 
    type: String, 
    enum: ['none', 'pending', 'approved'], 
    default: 'none'
    // none    = never requested (fresh employee)
    // pending = requested, waiting for admin
    // approved = inside the room, full access
  },
  permissions: [{
    type: String,
    enum: PERMISSIONS
  }]
});

module.exports = mongoose.model("User", UserSchema);
module.exports.PERMISSIONS = PERMISSIONS;