// const mongoose = require('mongoose');
// const Task = require('../models/Task');
// const User = require('../models/User');

// // GET: Tasks Assigned to current user
// exports.getAssignedTasks = async (req, res) => {
//   try {
//     // req.user.id comes from the authMiddleware we set up earlier
//     // .populate('assignedTo', 'name') replaces the ID with the actual User object (name only)
//     const tasks = await Task.find({ assignedTo: req.user.id })
//       .populate('assignedTo', 'name email') 
//       .populate('createdBy', 'name email')
//       .sort({ createdAt: -1 });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET: Tasks Created by current user
// exports.getCreatedTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({ createdBy: req.user.id })
//       .populate('assignedTo', 'name email')
//       .populate('createdBy', 'name email')
//       .sort({ createdAt: -1 });
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // POST: Create a Task
// exports.createTask = async (req, res) => {
//   try {    
//     let assignedUserId = req.body.assignedTo;

//     const isObjectId = mongoose.Types.ObjectId.isValid(assignedUserId);
//     if (!isObjectId) {
//         const assignedUser = await User.findOne({ 
//             $or: [{ email: assignedUserId }, { name: assignedUserId }] 
//         });
//         if (!assignedUser) {
//             return res.status(404).json({ message: "Assigned user not found" });
//         }
//         assignedUserId = assignedUser._id;
//     }

//     const task = new Task({
//       title: req.body.title,
//       description: req.body.description,
//       priority: req.body.priority,
//       status: req.body.status,
//       assignedTo: assignedUserId, 
//       createdBy: req.user.id,
//       dueDate: req.body.dueDate
//     });

//     const newTask = await task.save();
    
//     await newTask.populate('assignedTo', 'name');
//     await newTask.populate('createdBy', 'name');

//     req.io.emit('tasks-updated');
    
//     res.status(201).json(newTask);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// exports.updateTask = async (req, res) => {
//   try {
//     let task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Security Check: Only the Creator or the Assignee should update it
//     // (You can adjust this logic based on your rules)
//     if (task.createdBy.toString() !== req.user.id && task.assignedTo.toString() !== req.user.id) {
//        return res.status(401).json({ message: 'Not authorized to update this task' });
//     }

//     // Update fields
//     task = await Task.findByIdAndUpdate(req.params.id, req.body, {
//       new: true, // Return the updated object
//       runValidators: true
//     }).populate('assignedTo', 'name email').populate('createdBy', 'name email');

//     // Socket Emit: Update everyone's view
//     req.io.emit('tasks-updated');
    
//     // Notify the other party
//     // If I updated it, notify the person assigned (unless I assigned it to myself)
//     if (task.assignedTo._id.toString() !== req.user.id) {
//          req.io.emit(`notify-${task.assignedTo._id}`, {
//             message: `Task updated: ${task.title}`,
//             task: task
//         });
//     }

//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // DELETE: Delete a Task
// exports.deleteTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     // Security Check: Only Creator can delete?
//     if (task.createdBy.toString() !== req.user.id) {
//       return res.status(401).json({ message: 'Not authorized to delete this task' });
//     }

//     await task.deleteOne();

//     // Socket Emit
//     req.io.emit('tasks-updated');

//     res.json({ message: 'Task removed' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const { notifyUser } = require('../utils/notifications');

// --- GUARD HELPER ---
// Reusable check — user must be approved in a room to do anything with tasks
const requireApprovedRoom = (req, res) => {
  if (!req.user.roomId || req.user.roomStatus !== 'approved') {
    res.status(403).json({ message: 'You must be part of an approved room to manage tasks.' });
    return false;
  }
  return true;
};

// GET: Tasks assigned to current user (scoped to their room)
exports.getAssignedTasks = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const tasks = await Task.find({ 
      assignedTo: req.user.id,
      roomId: req.user.roomId        // ← room scope
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET: Tasks created by current user (scoped to their room)
exports.getCreatedTasks = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const tasks = await Task.find({ 
      createdBy: req.user.id,
      roomId: req.user.roomId        // ← room scope
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET: Completed tasks history (scoped to their room)
exports.getHistory = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const tasks = await Task.find({
      roomId: req.user.roomId,       // ← room scope
      status: 'Completed',
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ]
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST: Create a task (stamped with roomId)
exports.createTask = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    let assignedUserId = req.body.assignedTo;

    const isObjectId = mongoose.Types.ObjectId.isValid(assignedUserId);
    if (!isObjectId) {
      // Resolve by name or email — but only within the same room
      const assignedUser = await User.findOne({
        $or: [{ email: assignedUserId }, { name: assignedUserId }],
        roomId: req.user.roomId,     // ← can only assign to someone in same room
        roomStatus: 'approved'
      });
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found in your room' });
      }
      assignedUserId = assignedUser._id;
    } else {
      // Even if it's a valid ObjectId, verify they're in the same room
      const assignedUser = await User.findOne({
        _id: assignedUserId,
        roomId: req.user.roomId,
        roomStatus: 'approved'
      });
      if (!assignedUser) {
        return res.status(403).json({ message: 'You can only assign tasks to members of your room' });
      }
    }

    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      status: req.body.status,
      assignedTo: assignedUserId,
      createdBy: req.user.id,
      dueDate: req.body.dueDate,
      roomId: req.user.roomId,        // ← stamp with room
      completedAt: req.body.status === 'Completed' ? new Date() : null
    });

    const newTask = await task.save();
    await newTask.populate('assignedTo', 'name email');
    await newTask.populate('createdBy', 'name email');

    req.io.emit('tasks-updated');

    // Tell the assignee they've got a new task — unless they assigned it to themselves
    if (newTask.assignedTo._id.toString() !== req.user.id) {
      await notifyUser(req.io, {
        recipient: newTask.assignedTo._id,
        roomId: req.user.roomId,
        type: 'TASK_ASSIGNED',
        message: `${req.user.name} assigned you a task: "${newTask.title}"`,
        link: 'assigned',
        relatedId: newTask._id,
      });
    }

    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT: Update a task
exports.updateTask = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const existingTask = await Task.findOne({
      _id: req.params.id,
      roomId: req.user.roomId        // ← must be in same room
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isCreator = existingTask.createdBy.toString() === req.user.id;
    const isAssignee = existingTask.assignedTo.toString() === req.user.id;
    const canUpdateAny = req.user.role === 'Admin' || 
                          (req.user.permissions && req.user.permissions.includes('UPDATE_ANY_TASK'));

    if (!isCreator && !isAssignee && !canUpdateAny) {
      return res.status(401).json({ message: 'Not authorized to update this task' });
    }

    const updates = { ...req.body };
    delete updates.completedAt; // never trust a client-supplied completion time

    const wasCompleted = existingTask.status === 'Completed';
    const willBeCompleted = updates.status === 'Completed';
    const isReassignment = !!updates.assignedTo &&
      updates.assignedTo.toString() !== existingTask.assignedTo.toString();

    // Stamp/clear completedAt only on an actual status transition — this is
    // what performance stats use for "on-time completion", not updatedAt/createdAt.
    if (updates.status && updates.status !== existingTask.status) {
      if (updates.status === 'Completed') {
        updates.completedAt = new Date();
      } else if (existingTask.status === 'Completed') {
        updates.completedAt = null; // reopened — clear stale completion time
      }
    }

    // BUG FIX: this previously called findByIdAndUpdate(req.params.id, req.body, ...)
    // — passing the raw request body instead of the `updates` object built
    // above. That meant the completedAt stamping computed just above was
    // silently discarded on every save, so onTimeCompleted in the
    // performance-stats calculation never had real data to work with.
    // Passing `updates` here is the fix.
    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    req.io.emit('tasks-updated');

    // --- NOTIFICATIONS ---
    const actorId = req.user.id;
    const newAssigneeId = task.assignedTo._id.toString();
    const creatorId = task.createdBy._id.toString();
    const isCompletionTransition =
      (!wasCompleted && willBeCompleted) ||
      (wasCompleted && updates.status && updates.status !== 'Completed');

    // Reassigned to someone new
    if (isReassignment && newAssigneeId !== actorId) {
      await notifyUser(req.io, {
        recipient: newAssigneeId,
        roomId: req.user.roomId,
        type: 'TASK_REASSIGNED',
        message: `${req.user.name} assigned you the task: "${task.title}"`,
        link: 'assigned',
        relatedId: task._id,
      });
    }

    // Marked Completed → tell the creator (unless they did it themselves)
    if (!wasCompleted && willBeCompleted && creatorId !== actorId) {
      await notifyUser(req.io, {
        recipient: creatorId,
        roomId: req.user.roomId,
        type: 'TASK_COMPLETED',
        message: `${task.assignedTo.name} completed "${task.title}"`,
        link: 'created',
        relatedId: task._id,
      });
    }

    // Reopened → tell creator and assignee, whichever of them didn't do it
    if (wasCompleted && updates.status && updates.status !== 'Completed') {
      if (creatorId !== actorId) {
        await notifyUser(req.io, {
          recipient: creatorId,
          roomId: req.user.roomId,
          type: 'TASK_REOPENED',
          message: `"${task.title}" was reopened.`,
          link: 'created',
          relatedId: task._id,
        });
      }
      if (newAssigneeId !== actorId && newAssigneeId !== creatorId) {
        await notifyUser(req.io, {
          recipient: newAssigneeId,
          roomId: req.user.roomId,
          type: 'TASK_REOPENED',
          message: `"${task.title}" was reopened and assigned back to you.`,
          link: 'assigned',
          relatedId: task._id,
        });
      }
    }

    // Any other edit (not already covered by a completion/reassignment
    // notification above) — let whichever side didn't make the change know
    // something changed, without double-notifying for the same click.
    if (!isCompletionTransition && !isReassignment) {
      if (newAssigneeId !== actorId) {
        await notifyUser(req.io, {
          recipient: newAssigneeId,
          roomId: req.user.roomId,
          type: 'TASK_UPDATED',
          message: `${req.user.name} updated the task "${task.title}"`,
          link: 'assigned',
          relatedId: task._id,
        });
      }
      if (creatorId !== actorId && creatorId !== newAssigneeId) {
        await notifyUser(req.io, {
          recipient: creatorId,
          roomId: req.user.roomId,
          type: 'TASK_UPDATED',
          message: `${req.user.name} updated the task "${task.title}"`,
          link: 'created',
          relatedId: task._id,
        });
      }
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE: Delete a task
exports.deleteTask = async (req, res) => {
  try {
    if (!requireApprovedRoom(req, res)) return;

    const task = await Task.findOne({
      _id: req.params.id,
      roomId: req.user.roomId        // ← must be in same room
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isCreator = task.createdBy.toString() === req.user.id;
    const canDeleteAny = req.user.role === 'Admin' || 
                         (req.user.permissions && req.user.permissions.includes('DELETE_ANY_TASK'));

    if (!isCreator && !canDeleteAny) {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }

    const { title, assignedTo, createdBy } = task;
    const assigneeId = assignedTo.toString();
    const creatorId = createdBy.toString();

    await task.deleteOne();
    req.io.emit('tasks-updated');

    if (assigneeId !== req.user.id) {
      await notifyUser(req.io, {
        recipient: assigneeId,
        roomId: req.user.roomId,
        type: 'TASK_DELETED',
        message: `The task "${title}" assigned to you was deleted.`,
        link: 'assigned',
      });
    }
    if (creatorId !== req.user.id && creatorId !== assigneeId) {
      await notifyUser(req.io, {
        recipient: creatorId,
        roomId: req.user.roomId,
        type: 'TASK_DELETED',
        message: `Your task "${title}" was deleted.`,
        link: 'created',
      });
    }

    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// const mongoose = require('mongoose');
// const Task = require('../models/Task');
// const User = require('../models/User');

// // --- GUARD HELPER ---
// // Reusable check — user must be approved in a room to do anything with tasks
// const requireApprovedRoom = (req, res) => {
//   if (!req.user.roomId || req.user.roomStatus !== 'approved') {
//     res.status(403).json({ message: 'You must be part of an approved room to manage tasks.' });
//     return false;
//   }
//   return true;
// };

// // GET: Tasks assigned to current user (scoped to their room)
// exports.getAssignedTasks = async (req, res) => {
//   try {
//     if (!requireApprovedRoom(req, res)) return;

//     const tasks = await Task.find({ 
//       assignedTo: req.user.id,
//       roomId: req.user.roomId        // ← room scope
//     })
//       .populate('assignedTo', 'name email')
//       .populate('createdBy', 'name email')
//       .sort({ createdAt: -1 });

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET: Tasks created by current user (scoped to their room)
// exports.getCreatedTasks = async (req, res) => {
//   try {
//     if (!requireApprovedRoom(req, res)) return;

//     const tasks = await Task.find({ 
//       createdBy: req.user.id,
//       roomId: req.user.roomId        // ← room scope
//     })
//       .populate('assignedTo', 'name email')
//       .populate('createdBy', 'name email')
//       .sort({ createdAt: -1 });

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // GET: Completed tasks history (scoped to their room)
// exports.getHistory = async (req, res) => {
//   try {
//     if (!requireApprovedRoom(req, res)) return;

//     const tasks = await Task.find({
//       roomId: req.user.roomId,       // ← room scope
//       status: 'Completed',
//       $or: [
//         { createdBy: req.user.id },
//         { assignedTo: req.user.id }
//       ]
//     })
//       .populate('assignedTo', 'name email')
//       .populate('createdBy', 'name email')
//       .sort({ updatedAt: -1 });

//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // POST: Create a task (stamped with roomId)
// exports.createTask = async (req, res) => {
//   try {
//     if (!requireApprovedRoom(req, res)) return;

//     let assignedUserId = req.body.assignedTo;

//     const isObjectId = mongoose.Types.ObjectId.isValid(assignedUserId);
//     if (!isObjectId) {
//       // Resolve by name or email — but only within the same room
//       const assignedUser = await User.findOne({
//         $or: [{ email: assignedUserId }, { name: assignedUserId }],
//         roomId: req.user.roomId,     // ← can only assign to someone in same room
//         roomStatus: 'approved'
//       });
//       if (!assignedUser) {
//         return res.status(404).json({ message: 'Assigned user not found in your room' });
//       }
//       assignedUserId = assignedUser._id;
//     } else {
//       // Even if it's a valid ObjectId, verify they're in the same room
//       const assignedUser = await User.findOne({
//         _id: assignedUserId,
//         roomId: req.user.roomId,
//         roomStatus: 'approved'
//       });
//       if (!assignedUser) {
//         return res.status(403).json({ message: 'You can only assign tasks to members of your room' });
//       }
//     }

//     const task = new Task({
//       title: req.body.title,
//       description: req.body.description,
//       priority: req.body.priority,
//       status: req.body.status,
//       assignedTo: assignedUserId,
//       createdBy: req.user.id,
//       dueDate: req.body.dueDate,
//       roomId: req.user.roomId,        // ← stamp with room
//       completedAt: req.body.status === 'Completed' ? new Date() : null
//     });

//     const newTask = await task.save();
//     await newTask.populate('assignedTo', 'name email');
//     await newTask.populate('createdBy', 'name email');

//     req.io.emit('tasks-updated');

//     res.status(201).json(newTask);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // PUT: Update a task
// exports.updateTask = async (req, res) => {
//   try {
//     if (!requireApprovedRoom(req, res)) return;

//     let task = await Task.findOne({
//       _id: req.params.id,
//       roomId: req.user.roomId        // ← must be in same room
//     });

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     const isCreator = task.createdBy.toString() === req.user.id;
//     const isAssignee = task.assignedTo.toString() === req.user.id;
//     const canUpdateAny = req.user.role === 'Admin' || 
//                           (req.user.permissions && req.user.permissions.includes('UPDATE_ANY_TASK'));

//     if (!isCreator && !isAssignee && !canUpdateAny) {
//       return res.status(401).json({ message: 'Not authorized to update this task' });
//     }

//     const updates = { ...req.body };
//     delete updates.completedAt; // never trust a client-supplied completion time

//     // Stamp/clear completedAt only on an actual status transition — this is
//     // what performance stats use for "on-time completion", not updatedAt/createdAt.
//     if (updates.status && updates.status !== task.status) {
//       if (updates.status === 'Completed') {
//         updates.completedAt = new Date();
//       } else if (task.status === 'Completed') {
//         updates.completedAt = null; // reopened — clear stale completion time
//       }
//     }

//     task = await Task.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true
//     })
//       .populate('assignedTo', 'name email')
//       .populate('createdBy', 'name email');

//     req.io.emit('tasks-updated');

//     if (task.assignedTo._id.toString() !== req.user.id) {
//       req.io.emit(`notify-${task.assignedTo._id}`, {
//         message: `Task updated: ${task.title}`,
//         task
//       });
//     }

//     res.json(task);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // DELETE: Delete a task
// exports.deleteTask = async (req, res) => {
//   try {
//     if (!requireApprovedRoom(req, res)) return;

//     const task = await Task.findOne({
//       _id: req.params.id,
//       roomId: req.user.roomId        // ← must be in same room
//     });

//     if (!task) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     const isCreator = task.createdBy.toString() === req.user.id;
//     const canDeleteAny = req.user.role === 'Admin' || 
//                          (req.user.permissions && req.user.permissions.includes('DELETE_ANY_TASK'));

//     if (!isCreator && !canDeleteAny) {
//       return res.status(401).json({ message: 'Not authorized to delete this task' });
//     }

//     await task.deleteOne();
//     req.io.emit('tasks-updated');

//     res.json({ message: 'Task removed' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };