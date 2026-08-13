const User = require('../models/User');
const Task = require('../models/Task');

// Get Current User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Current User Profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update allowed fields
    user.name = req.body.name || user.name;
    user.mobile = req.body.mobile || user.mobile;
    user.designation = req.body.designation || user.designation;
    // Note: We typically do not allow changing Email or Role here for security

    const updatedUser = await user.save();
    
    // Return updated user without password
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      designation: updatedUser.designation,
      mobile: updatedUser.mobile
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- SHARED HELPER: computes assigned/created tasks + performance stats ---
// Used by both getUserStats (admin viewing a teammate) and getProfileStats
// (a user viewing their own performance) so the numbers never drift apart.

// dueDate represents a whole calendar day, not an exact deadline instant
// (it's stored as midnight UTC of the chosen day). So "on time" / "overdue"
// must compare calendar dates, not raw timestamps — otherwise a task
// completed at 3pm on its due date reads as "late" the moment the clock
// passes midnight.
const toUTCDateOnly = (date) => {
  const d = new Date(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

const computeStatsForUser = async (targetUserId, roomId) => {
  const now = new Date();
  const todayUTC = toUTCDateOnly(now);

  // All tasks assigned to the target user
  const assignedTasks = await Task.find({ assignedTo: targetUserId, roomId })
    .populate('createdBy', 'name')
    .sort({ dueDate: 1 });

  // All tasks created by the target user
  const createdTasks = await Task.find({ createdBy: targetUserId, roomId })
    .populate('assignedTo', 'name')
    .sort({ dueDate: 1 });

  const totalAssigned = assignedTasks.length;
  const totalCreated = createdTasks.length;
  const inProgress = assignedTasks.filter(t => t.status === 'In Progress').length;

  // Missed: not completed AND past due date
  const deadlinesMissed = assignedTasks.filter(t =>
    t.status !== 'Completed' && new Date(t.dueDate) < todayUTC
  ).length;

  // On-time completed: actually completed (completedAt set) on or before the due date's day.
  // Tasks completed before this fix shipped won't have completedAt recorded — they're
  // excluded here rather than guessed at, since createdAt was never a reliable stand-in.
  const onTimeCompleted = assignedTasks.filter(t => {
    if (t.status !== 'Completed' || !t.completedAt) return false;
    return toUTCDateOnly(t.completedAt) <= toUTCDateOnly(t.dueDate);
  }).length;

  const performancePercent = totalAssigned > 0
    ? Math.round((onTimeCompleted / totalAssigned) * 100)
    : 0;

  return {
    stats: {
      totalAssigned,
      totalCreated,
      inProgress,
      deadlinesMissed,
      onTimeCompleted,
      performancePercent
    },
    assignedTasks,
    createdTasks
  };
};

// GET STATS FOR ANY USER (requires VIEW_ALL_STATS permission or Admin)
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Target must be in same room
    const targetUser = await User.findOne({
      _id: userId,
      roomId: req.user.roomId,
      roomStatus: 'approved'
    }).select('-password');

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found in your room' });
    }

    // Block viewing Admin/CEO stats
    if (targetUser.role === 'Admin') {
      return res.status(403).json({ message: 'Cannot view stats for Admin accounts' });
    }

    const { stats, assignedTasks, createdTasks } = await computeStatsForUser(userId, req.user.roomId);
    res.json({ user: targetUser, stats, assignedTasks, createdTasks

    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET STATS FOR THE CURRENTLY LOGGED-IN USER (own profile — no permission gate needed)
exports.getProfileStats = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('-password');
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    // Not in an approved room yet — nothing to compute, return zeroed stats
    if (!currentUser.roomId || currentUser.roomStatus !== 'approved') {
      return res.json({
        user: currentUser,
        stats: {
          totalAssigned: 0,
          totalCreated: 0,
          inProgress: 0,
          deadlinesMissed: 0,
          onTimeCompleted: 0,
          performancePercent: 0
        },
        assignedTasks: [],
        createdTasks: []
      });
    }

    const { stats, assignedTasks, createdTasks } = await computeStatsForUser(currentUser._id, currentUser.roomId);

    res.json({ user: currentUser, stats, assignedTasks, createdTasks });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};