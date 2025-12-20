const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');

// GET: Tasks Assigned to current user
exports.getAssignedTasks = async (req, res) => {
  try {
    // req.user.id comes from the authMiddleware we set up earlier
    // .populate('assignedTo', 'name') replaces the ID with the actual User object (name only)
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('assignedTo', 'name email') 
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET: Tasks Created by current user
exports.getCreatedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user.id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST: Create a Task
exports.createTask = async (req, res) => {
  try {    
    let assignedUserId = req.body.assignedTo;

    const isObjectId = mongoose.Types.ObjectId.isValid(assignedUserId);
    if (!isObjectId) {
        const assignedUser = await User.findOne({ 
            $or: [{ email: assignedUserId }, { name: assignedUserId }] 
        });
        if (!assignedUser) {
            return res.status(404).json({ message: "Assigned user not found" });
        }
        assignedUserId = assignedUser._id;
    }

    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      status: req.body.status,
      assignedTo: assignedUserId, 
      createdBy: req.user.id,
      dueDate: req.body.dueDate
    });

    const newTask = await task.save();
    
    await newTask.populate('assignedTo', 'name');
    await newTask.populate('createdBy', 'name');

    req.io.emit('tasks-updated');
    
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Security Check: Only the Creator or the Assignee should update it
    // (You can adjust this logic based on your rules)
    if (task.createdBy.toString() !== req.user.id && task.assignedTo.toString() !== req.user.id) {
       return res.status(401).json({ message: 'Not authorized to update this task' });
    }

    // Update fields
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the updated object
      runValidators: true
    }).populate('assignedTo', 'name email').populate('createdBy', 'name email');

    // Socket Emit: Update everyone's view
    req.io.emit('tasks-updated');
    
    // Notify the other party
    // If I updated it, notify the person assigned (unless I assigned it to myself)
    if (task.assignedTo._id.toString() !== req.user.id) {
         req.io.emit(`notify-${task.assignedTo._id}`, {
            message: `Task updated: ${task.title}`,
            task: task
        });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE: Delete a Task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Security Check: Only Creator can delete?
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    // Socket Emit
    req.io.emit('tasks-updated');

    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};