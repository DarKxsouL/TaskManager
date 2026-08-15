const mongoose = require("mongoose");
const { PERMISSIONS } = require("../middleware/permissionsMiddleware");

// const PERMISSIONS = [
//   'APPROVE_MEMBERS',
//   'REMOVE_MEMBERS',
//   'PROMOTE_MEMBERS',
//   'MANAGE_ROLES',
//   'ASSIGN_ROLES',
//   'DELETE_ANY_TASK',
//   'UPDATE_ANY_TASK',
//   'VIEW_ALL_STATS',
//   'VIEW_HIERARCHY',
//   'EDIT_HIERARCHY',
// ];

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
  }],

  // --- HIERARCHY / ORG CHART ---
  // A user starts as an independent node (hierarchyParent: null) until an
  // editor connects them under someone. Admin/CEO nodes are never allowed
  // to have a parent — they're always a root of the chart (see
  // hierarchyController, which enforces this on write).
  hierarchyParent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // Canvas position, persisted so every viewer sees the same layout. Left
  // unset (null) until an editor drags the node for the first time — the
  // frontend falls back to an auto-arranged grid position for anything
  // without one.
  hierarchyPosition: {
    x: { type: Number, default: null },
    y: { type: Number, default: null },
  },
});

module.exports = mongoose.model("User", UserSchema);
module.exports.PERMISSIONS = PERMISSIONS;