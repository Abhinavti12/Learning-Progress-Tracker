const mongoose = require('mongoose');
const StudySession = require('../models/StudySession');
const LearningGoal = require('../models/LearningGoal');

// @desc    Get all study sessions for user with populated goal info
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const { goalId, needsRevision, rating, search, limit = 50 } = req.query;

    const filter = {
      userId: req.user._id
    };

    if (goalId && goalId !== 'All') {
      filter.goalId = goalId;
    }

    if (needsRevision !== undefined && needsRevision !== 'All') {
      filter.needsRevision = needsRevision === 'true';
    }

    if (rating && rating !== 'All') {
      filter.understandingRating = Number(rating);
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { topicStudied: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const sessions = await StudySession.find(filter)
      .populate('goalId', 'title category')
      .populate('activityId', 'title type')
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit));

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    res.status(200).json({
      success: true,
      count: sessions.length,
      totalMinutes,
      totalHours,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log a new study session
// @route   POST /api/sessions
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const {
      goalId,
      activityId,
      date,
      durationMinutes,
      topicStudied,
      notes,
      understandingRating,
      needsRevision
    } = req.body;

    if (!durationMinutes || !topicStudied || topicStudied.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide duration in minutes and topic studied'
      });
    }

    if (!understandingRating || understandingRating < 1 || understandingRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an understanding rating between 1 and 5'
      });
    }

    // Auto flag if rating is 1 or 2, or if explicitly passed
    const shouldRevise = needsRevision !== undefined ? Boolean(needsRevision) : Number(understandingRating) <= 2;

    const session = await StudySession.create({
      userId: req.user._id,
      goalId: goalId || null,
      activityId: activityId || null,
      date: date ? new Date(date) : new Date(),
      durationMinutes: Number(durationMinutes),
      topicStudied: topicStudied.trim(),
      notes: notes ? notes.trim() : '',
      understandingRating: Number(understandingRating),
      needsRevision: shouldRevise
    });

    const populatedSession = await StudySession.findById(session._id)
      .populate('goalId', 'title category')
      .populate('activityId', 'title type');

    res.status(201).json({
      success: true,
      data: populatedSession
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update study session
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res, next) => {
  try {
    let session = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found or unauthorized'
      });
    }

    const {
      goalId,
      activityId,
      date,
      durationMinutes,
      topicStudied,
      notes,
      understandingRating,
      needsRevision
    } = req.body;

    if (goalId !== undefined) session.goalId = goalId || null;
    if (activityId !== undefined) session.activityId = activityId || null;
    if (date !== undefined) session.date = new Date(date);
    if (durationMinutes !== undefined) session.durationMinutes = Number(durationMinutes);
    if (topicStudied !== undefined) session.topicStudied = topicStudied.trim();
    if (notes !== undefined) session.notes = notes.trim();
    if (understandingRating !== undefined) session.understandingRating = Number(understandingRating);
    if (needsRevision !== undefined) session.needsRevision = Boolean(needsRevision);

    await session.save();

    const populatedSession = await StudySession.findById(session._id)
      .populate('goalId', 'title category')
      .populate('activityId', 'title type');

    res.status(200).json({
      success: true,
      data: populatedSession
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle needsRevision status for a topic
// @route   PATCH /api/sessions/:id/revision
// @access  Private
const toggleRevision = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found or unauthorized'
      });
    }

    session.needsRevision = !session.needsRevision;
    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study session
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = async (req, res, next) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Study session not found or unauthorized'
      });
    }

    await StudySession.deleteOne({ _id: session._id });

    res.status(200).json({
      success: true,
      message: 'Study session removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  createSession,
  updateSession,
  toggleRevision,
  deleteSession
};
