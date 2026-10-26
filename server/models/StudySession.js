const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningGoal',
      default: null,
      index: true
    },
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningActivity',
      default: null,
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Please specify study duration in minutes'],
      min: [1, 'Study duration must be at least 1 minute'],
      max: [1440, 'Study duration cannot exceed 24 hours']
    },
    topicStudied: {
      type: String,
      required: [true, 'Please specify topic or subject studied'],
      trim: true,
      maxlength: [200, 'Topic cannot exceed 200 characters']
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [3000, 'Notes cannot exceed 3000 characters']
    },
    understandingRating: {
      type: Number,
      required: [true, 'Please provide an understanding rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    needsRevision: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: auto-flag for revision if understanding rating is 1 or 2
studySessionSchema.pre('save', function (next) {
  if (this.understandingRating <= 2 && this.needsRevision === false) {
    this.needsRevision = true;
  }
  next();
});

// Indexes for fast date-range queries, weekly consistency, and self-assessment filtering
studySessionSchema.index({ userId: 1, date: -1 });
studySessionSchema.index({ userId: 1, understandingRating: 1 });
studySessionSchema.index({ userId: 1, needsRevision: 1 });

const StudySession = mongoose.model('StudySession', studySessionSchema);

module.exports = StudySession;
