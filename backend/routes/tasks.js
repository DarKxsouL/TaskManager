const express = require('express');
const router = express.Router();
const { getAssignedTasks, getCreatedTasks, createTask, updateTask, getHistory,  deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');


router.get('/assigned', protect, getAssignedTasks);
router.get('/created', protect, getCreatedTasks);
router.post('/', protect, createTask);
router.put('/:id', protect, updateTask);
router.get('/history', protect, getHistory);
router.delete('/:id', protect, deleteTask);

// GET all completed tasks (for history)
router.get('/history', protect, async (req, res) => {
  try {
    const tasks = await Task.find({
      status: 'Completed',
      $or: [{ createdBy: req.user.id }, { assignedTo: req.user.id }]
    })
    .populate('assignedTo', 'name')
    .populate('createdBy', 'name')
    .sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;