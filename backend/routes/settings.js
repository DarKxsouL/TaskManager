const express = require('express');
const router = express.Router();
const { getOptions, addJobRole, addDesignation, deleteJobRole, deleteDesignation } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

// Only logged in users can see options, logic could be refined
router.get('/', protect, getOptions);

// Only Admin can add options (You can add specific admin check middleware later)
router.post('/role', protect, addJobRole);
router.post('/designation', protect, addDesignation);

router.delete('/role', protect, deleteJobRole);
router.delete('/designation', protect, deleteDesignation);

module.exports = router;