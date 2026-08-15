const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireHierarchyView, requireHierarchyEdit } = require('../middleware/hierarchyAccess');
const {
  getHierarchy,
  updateNodePosition,
  createConnection,
  detachConnection,
  deleteConnection,
} = require('../controllers/hierarchyController');

router.get('/', protect, requireHierarchyView, getHierarchy);

router.patch('/:userId/position', protect, requireHierarchyEdit, updateNodePosition);

router.post('/connections', protect, requireHierarchyEdit, createConnection);
router.patch('/connections/:childId/detach', protect, requireHierarchyEdit, detachConnection);
router.delete('/connections/:childId', protect, requireHierarchyEdit, deleteConnection);

module.exports = router;