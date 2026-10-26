const mongoose = require('mongoose');

const learningActivitySchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningGoal',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide an activity title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    type: {
      type: String,
      enum: {
        values: ['Lesson', 'Reading', 'Video', 'Practice', 'Project', 'Quiz'],
        message: '{VALUE} is not a valid activity type'
      },
      default: 'Lesson'
    },
    resourceLink: {
      type: String,
      default: '',
      trim: true
    },
    completed: {
      type: Boolean,
      default: false,
      index: true
    },
    dueDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

learningActivitySchema.index({ goalId: 1, completed: 1 });
learningActivitySchema.index({ userId: 1, completed: 1, dueDate: 1 });

const LearningActivity = mongoose.model('LearningActivity', learningActivitySchema);

module.exports = LearningActivity;
