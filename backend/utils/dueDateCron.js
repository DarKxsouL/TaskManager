const cron = require('node-cron');
const Task = require('../models/Task');
const { notifyUser } = require('./notifications');

const toUTCDateOnly = (date) => {
  const d = new Date(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const ONE_DAY_MS = 86400000;

// Runs once a day over every open (non-Completed) task:
//   1. dueDate is today             → TASK_DUE_TODAY
//   2. dueDate was exactly yesterday → TASK_OVERDUE
//
// The overdue check only fires the day a task *crosses over* into overdue —
// not every day it remains overdue — otherwise the assignee would get the
// same reminder forever. One side effect: a task that was already overdue
// before this feature existed won't retroactively notify anyone; only tasks
// that cross the line after the cron starts running will.
const runDueDateCheck = async (io) => {
  try {
    const now = new Date();
    const todayUTC = toUTCDateOnly(now);

    const openTasks = await Task.find({ status: { $ne: 'Completed' } })
      .populate('assignedTo', 'name');

    for (const task of openTasks) {
      if (!task.assignedTo) continue;

      const dueUTC = toUTCDateOnly(task.dueDate);

      if (dueUTC === todayUTC) {
        await notifyUser(io, {
          recipient: task.assignedTo._id,
          roomId: task.roomId,
          type: 'TASK_DUE_TODAY',
          message: `"${task.title}" is due today.`,
          link: 'assigned',
          relatedId: task._id,
        });
      } else if (dueUTC === todayUTC - ONE_DAY_MS) {
        await notifyUser(io, {
          recipient: task.assignedTo._id,
          roomId: task.roomId,
          type: 'TASK_OVERDUE',
          message: `"${task.title}" is now overdue.`,
          link: 'overdue',
          relatedId: task._id,
        });
      }
    }
  } catch (error) {
    console.error('Due-date cron failed:', error.message);
  }
};

// Kicks off the daily schedule — 08:00 server time by default. Adjust the
// cron expression below if your users are mostly in a different timezone
// than wherever this server runs.
const startDueDateCron = (io) => {
  cron.schedule('0 8 * * *', () => runDueDateCheck(io));
  console.log('Due-date notification cron scheduled (daily, 08:00 server time).');
};

module.exports = { startDueDateCron, runDueDateCheck };