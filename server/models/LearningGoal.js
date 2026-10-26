const mongoose = require('mongoose');

const learningGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a learning goal title'],
      trim: true,
      maxlength: [120, 'Goal title cannot exceed 120 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      maxlength: [60, 'Category cannot exceed 60 characters']
    },
    targetDate: {
      type: Date
    },
    status: {
      type: String,
      enum: {
        values: ['Not Started', 'In Progress', 'Completed'],
        message: '{VALUE} is not a valid goal status'
      },
      default: 'Not Started'
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for user goal retrieval and categorization
learningGoalSchema.index({ userId: 1, status: 1 });
learningGoalSchema.index({ userId: 1, category: 1 });

const LearningGoal = mongoose.model('LearningGoal', learningGoalSchema);

module.exports = LearningGoal;
