const mongoose = require('mongoose');
const LearningGoal = require('../models/LearningGoal');
const LearningActivity = require('../models/LearningActivity');
const StudySession = require('../models/StudySession');

// @desc    Get comprehensive analytics, weekly consistency, and self-assessment metrics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Goal Metrics & Category Distribution
    const [goalStats] = await LearningGoal.aggregate([
      { $match: { userId } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          byCategory: [
            {
              $group: {
                _id: '$category',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ]
        }
      }
    ]);

    const totalGoals = goalStats.total[0]?.count || 0;
    const goalStatusMap = {
      'Not Started': 0,
      'In Progress': 0,
      'Completed': 0
    };
    (goalStats.byStatus || []).forEach((item) => {
      if (goalStatusMap[item._id] !== undefined) {
        goalStatusMap[item._id] = item.count;
      }
    });

    // 2. Activity Metrics
    const [activityStats] = await LearningActivity.aggregate([
      { $match: { userId } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          completed: [
            { $match: { completed: true } },
            { $count: 'count' }
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const totalActivities = activityStats.total[0]?.count || 0;
    const completedActivities = activityStats.completed[0]?.count || 0;
    const overallActivityProgress = totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;

    // 3. Study Session & Understanding Metrics
    const [sessionStats] = await StudySession.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMinutes: { $sum: '$durationMinutes' },
          avgRating: { $avg: '$understandingRating' },
          revisionCount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$needsRevision', true] },
                    { $lte: ['$understandingRating', 2] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const totalSessions = sessionStats?.totalSessions || 0;
    const totalMinutes = sessionStats?.totalMinutes || 0;
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const avgUnderstandingRating = sessionStats?.avgRating
      ? Math.round(sessionStats.avgRating * 10) / 10
      : 0;
    const revisionCount = sessionStats?.revisionCount || 0;

    // 4. Weekly Consistency Pipeline (Daily breakdown for past 7 days)
    const consistencyPipeline = [
      {
        $match: {
          userId,
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          minutes: { $sum: '$durationMinutes' },
          sessionCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const rawWeeklyStats = await StudySession.aggregate(consistencyPipeline);

    // Build complete 7-day array ensuring every day is represented even with 0 minutes
    const weeklyConsistency = [];
    const dayMap = {};
    rawWeeklyStats.forEach((item) => {
      dayMap[item._id] = item;
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().substring(0, 10);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const record = dayMap[dateKey];
      weeklyConsistency.push({
        date: dateKey,
        day: dayName,
        minutes: record ? record.minutes : 0,
        hours: record ? Math.round((record.minutes / 60) * 10) / 10 : 0,
        sessions: record ? record.sessionCount : 0
      });
    }

    // 5. Topics Needing Revision (Self-Assessment focus)
    const revisionTopics = await StudySession.find({
      userId,
      $or: [{ needsRevision: true }, { understandingRating: { $lte: 2 } }]
    })
      .populate('goalId', 'title category')
      .sort({ date: -1 })
      .limit(8);

    // 6. Recent Study Sessions
    const recentSessions = await StudySession.find({ userId })
      .populate('goalId', 'title category')
      .sort({ date: -1, createdAt: -1 })
      .limit(6);

    // 7. Goals with progress & logged study hours
    const goalsWithProgress = await LearningGoal.aggregate([
      { $match: { userId } },
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
          title: 1,
          category: 1,
          status: 1,
          targetDate: 1,
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
      { $sort: { updatedAt: -1 } },
      { $limit: 6 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalGoals,
          completedGoals: goalStatusMap['Completed'],
          inProgressGoals: goalStatusMap['In Progress'],
          notStartedGoals: goalStatusMap['Not Started'],
          totalActivities,
          completedActivities,
          overallActivityProgress,
          totalSessions,
          totalMinutes,
          totalHours,
          avgUnderstandingRating,
          revisionCount
        },
        weeklyConsistency,
        categoryBreakdown: goalStats.byCategory || [],
        revisionTopics,
        recentSessions,
        goalsWithProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview
};
