const LearningActivity = require('../models/LearningActivity');
const LearningGoal = require('../models/LearningGoal');

// Helper to auto-sync goal status when activities are updated
const syncGoalStatus = async (goalId) => {
  const activities = await LearningActivity.find({ goalId });
  if (activities.length === 0) return;

  const allCompleted = activities.every((a) => a.completed);
  const anyCompleted = activities.some((a) => a.completed);

  const goal = await LearningGoal.findById(goalId);
  if (!goal) return;

  if (allCompleted && goal.status !== 'Completed') {
    goal.status = 'Completed';
    await goal.save();
  } else if (!allCompleted && anyCompleted && goal.status === 'Not Started') {
    goal.status = 'In Progress';
    await goal.save();
  } else if (!allCompleted && goal.status === 'Completed') {
    goal.status = 'In Progress';
    await goal.save();
  }
};

// @desc    Get all activities for a learning goal
// @route   GET /api/activities/goal/:goalId
// @access  Private
const getActivitiesByGoal = async (req, res, next) => {
  try {
    const { goalId } = req.params;

    const goal = await LearningGoal.findOne({
      _id: goalId,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized'
      });
    }

    const activities = await LearningActivity.find({
      goalId,
      userId: req.user._id
    }).sort({ completed: 1, dueDate: 1, createdAt: -1 });

    const totalActivities = activities.length;
    const completedActivities = activities.filter((a) => a.completed).length;
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    res.status(200).json({
      success: true,
      count: activities.length,
      progress,
      totalActivities,
      completedActivities,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new learning activity under a goal
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res, next) => {
  try {
    const { goalId, title, type, resourceLink, dueDate } = req.body;

    if (!goalId || !title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Goal ID and activity title are required'
      });
    }

    const goal = await LearningGoal.findOne({
      _id: goalId,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found or unauthorized'
      });
    }

    const activity = await LearningActivity.create({
      goalId,
      userId: req.user._id,
      title: title.trim(),
      type: type || 'Lesson',
      resourceLink: resourceLink ? resourceLink.trim() : '',
      dueDate: dueDate ? new Date(dueDate) : null,
      completed: false
    });

    if (goal.status === 'Not Started') {
      goal.status = 'In Progress';
      await goal.save();
    }

    res.status(201).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update activity details
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res, next) => {
  try {
    let activity = await LearningActivity.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or unauthorized'
      });
    }

    const { title, type, resourceLink, dueDate, completed } = req.body;

    if (title !== undefined) activity.title = title.trim();
    if (type !== undefined) activity.type = type;
    if (resourceLink !== undefined) activity.resourceLink = resourceLink.trim();
    if (dueDate !== undefined) activity.dueDate = dueDate ? new Date(dueDate) : null;
    if (completed !== undefined) activity.completed = Boolean(completed);

    await activity.save();
    await syncGoalStatus(activity.goalId);

    res.status(200).json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle activity completion status
// @route   PATCH /api/activities/:id/toggle
// @access  Private
const toggleActivityComplete = async (req, res, next) => {
  try {
    const activity = await LearningActivity.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or unauthorized'
      });
    }

    activity.completed = !activity.completed;
    await activity.save();

    await syncGoalStatus(activity.goalId);

    const activities = await LearningActivity.find({ goalId: activity.goalId });
    const totalActivities = activities.length;
    const completedActivities = activities.filter((a) => a.completed).length;
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    res.status(200).json({
      success: true,
      data: activity,
      goalStats: {
        totalActivities,
        completedActivities,
        progress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res, next) => {
  try {
    const activity = await LearningActivity.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found or unauthorized'
      });
    }

    const goalId = activity.goalId;
    await LearningActivity.deleteOne({ _id: activity._id });

    await syncGoalStatus(goalId);

    res.status(200).json({
      success: true,
      message: 'Learning activity deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivitiesByGoal,
  createActivity,
  updateActivity,
  toggleActivityComplete,
  deleteActivity
};
