// All 8 permission keys in one place — import this anywhere you need to reference them
const PERMISSIONS = [
  'APPROVE_MEMBERS',
  'REMOVE_MEMBERS',
  'PROMOTE_MEMBERS',
  'MANAGE_ROLES',
  'ASSIGN_ROLES',
  'DELETE_ANY_TASK',
  'UPDATE_ANY_TASK',
  'VIEW_ALL_STATS',
  'VIEW_HIERARCHY',
  'EDIT_HIERARCHY',
];

// hasPermission(key) returns an Express middleware function
// Usage: router.patch('/route', protect, hasPermission('APPROVE_MEMBERS'), controller)
const hasPermission = (key) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized — no user attached to request.' });
    }
    
    // Admin always passes — never check permissions array for Admin
    if (req.user.role === 'Admin') return next();

    // Employee must have explicit permission granted
    if (req.user.permissions && req.user.permissions.includes(key)) {
      return next();
    }

    return res.status(403).json({ 
      message: `Access denied. You need the '${key}' permission to do this.` 
    });
  };
};

module.exports = { hasPermission, PERMISSIONS };