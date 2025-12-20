const express = require('express');
const router = express.Router();
const { getAssignedTasks, getCreatedTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');


router.get('/assigned', protect, getAssignedTasks);
router.get('/created', protect, getCreatedTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;