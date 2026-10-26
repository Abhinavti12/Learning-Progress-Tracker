const mongoose = require('mongoose');
const LearningGoal = require('../models/LearningGoal');
const LearningActivity = require('../models/LearningActivity');
const StudySession = require('../models/StudySession');

// @desc    Get all learning goals for user with activity progress & study hours logged
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const { category, status, search, sort = 'createdAt_desc' } = req.query;

    const matchConditions = {
      userId: new mongoose.Types.ObjectId(req.user._id)
    };

    if (status && status !== 'All') {
      matchConditions.status = status;
    }

    if (category && category !== 'All') {
      matchConditions.category = category;
    }

    if (search && search.trim() !== '') {
      matchConditions.title = { $regex: search.trim(), $options: 'i' };
    }

    let sortStage = { createdAt: -1 };
    if (sort === 'targetDate_asc') {
      sortStage = { targetDate: 1 };
    } else if (sort === 'title_asc') {
      sortStage = { title: 1 };
    } else if (sort === 'progress_desc') {
      sortStage = { progress: -1 };
    }

    const goals = await LearningGoal.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'learningactivities',
          localField: '_id',
          foreignField: 'goalId',
          as: 'activities'
        }
      },
      {
        $lookup: {
          from: 'studysessions',
          localField: '_id',
          foreignField: 'goalId',
          as: 'sessions'
        }
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          title: 1,
          description: 1,
          category: 1,
          targetDate: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          totalActivities: { $size: '$activities' },
          completedActivities: {
            $size: {
              $filter: {
                input: '$activities',
                as: 'act',
                cond: { $eq: ['$$act.completed', true] }
              }
            }
          },
          totalStudyMinutes: { $sum: '$sessions.durationMinutes' },
          totalStudyHours: {
            $round: [{ $divide: [{ $ifNull: [{ $sum: '$sessions.durationMinutes' }, 0] }, 60] }, 1]
          },
          progress: {
            $cond: [
              { $gt: [{ $size: '$activities' }, 0] },
              {
                $round: [
                  {
                    $multiply: [
                      {
                        $divide: [
                          {
                            $size: {
                              $filter: {
                                input: '$activities',
                                as: 'act',
                                cond: { $eq: ['$$act.completed', true] }
                              }
                            }
                          },
                          { $size: '$activities' }
                        ]
                      },
                      100
                    ]
                  },
                  0
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: sortStage }
    ]);

    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single learning goal with activities & study sessions
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = async (req, res, next) => {
  try {
    const goal = await LearningGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Learning goal not found or unauthorized'
      });
    }

    const activities = await LearningActivity.find({ goalId: goal._id }).sort({
      completed: 1,
      dueDate: 1,
      createdAt: -1
    });

    const sessions = await StudySession.find({ goalId: goal._id }).sort({ date: -1 });

    const totalActivities = activities.length;
    const completedActivities = activities.filter((a) => a.completed).length;
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
    const totalStudyMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

    res.status(200).json({
      success: true,
      data: {
        ...goal.toObject(),
        totalActivities,
        completedActivities,
        progress,
        totalStudyMinutes,
        totalStudyHours,
        activities,
        sessions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new learning goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { title, description, category, targetDate, status } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a learning goal title'
      });
    }

    const goal = await LearningGoal.create({
      userId: req.user._id,
      title: title.trim(),
      description: description || '',
      category: category && category.trim() !== '' ? category.trim() : 'General',
      targetDate: targetDate ? new Date(targetDate) : null,
      status: status || 'Not Started'
    });

    res.status(201).json({
      success: true,
      data: {
        ...goal.toObject(),
        totalActivities: 0,
        completedActivities: 0,
        progress: 0,
        totalStudyMinutes: 0,
        totalStudyHours: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update learning goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    let goal = await LearningGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Learning goal not found or unauthorized'
      });
    }

    const { title, description, category, targetDate, status } = req.body;

    if (title !== undefined) goal.title = title.trim();
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category.trim();
    if (targetDate !== undefined) goal.targetDate = targetDate ? new Date(targetDate) : null;
    if (status !== undefined) goal.status = status;

    await goal.save();

    const activities = await LearningActivity.find({ goalId: goal._id });
    const totalActivities = activities.length;
    const completedActivities = activities.filter((a) => a.completed).length;
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...goal.toObject(),
        totalActivities,
        completedActivities,
        progress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete learning goal & cascade delete activities
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await LearningGoal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Learning goal not found or unauthorized'
      });
    }

    // Cascade delete activities
    const delActivities = await LearningActivity.deleteMany({ goalId: goal._id });
    // Unlink sessions from this goal
    await StudySession.updateMany({ goalId: goal._id }, { $set: { goalId: null } });

    await LearningGoal.deleteOne({ _id: goal._id });

    res.status(200).json({
      success: true,
      message: 'Learning goal and activities removed successfully',
      deletedActivitiesCount: delActivities.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal
};
