const express = require('express');
const router = express.Router();
const { getOptions, addJobRole, addDesignation, deleteJobRole, deleteDesignation } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { hasPermission } = require('../middleware/permissionsMiddleware');

// Only logged in users can see options, logic could be refined
router.get('/', protect, getOptions);

// Only Admin can add options (You can add specific admin check middleware later)
router.post('/role', protect, hasPermission('MANAGE_ROLES'), addJobRole);
router.post('/designation', protect, hasPermission('MANAGE_ROLES'), addDesignation);

router.delete('/role', protect, hasPermission('MANAGE_ROLES'), deleteJobRole);
router.delete('/designation', protect, hasPermission('MANAGE_ROLES'), deleteDesignation);

module.exports = router;