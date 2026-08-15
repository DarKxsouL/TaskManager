// Two access tiers for the hierarchy page:
//   VIEW_HIERARCHY  → read-only
//   EDIT_HIERARCHY  → read + edit (a superset — edit implies view)
// Admin/CEO always pass both, same convention as hasPermission() in
// permissionsMiddleware.js.
const isAdminTier = (user) => user.role === 'Admin' || user.role === 'CEO';

const requireHierarchyView = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized — no user attached to request.' });
  }

  const perms = req.user.permissions || [];
  if (isAdminTier(req.user) || perms.includes('VIEW_HIERARCHY') || perms.includes('EDIT_HIERARCHY')) {
    return next();
  }

  return res.status(403).json({ message: 'You do not have access to the hierarchy page.' });
};

const requireHierarchyEdit = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized — no user attached to request.' });
  }

  const perms = req.user.permissions || [];
  if (isAdminTier(req.user) || perms.includes('EDIT_HIERARCHY')) {
    return next();
  }

  return res.status(403).json({ message: 'You do not have permission to edit the hierarchy.' });
};

module.exports = { requireHierarchyView, requireHierarchyEdit, isAdminTier };