const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true
    },
    level: {
      type: String,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true
    },
    answer: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('McqQuestion', mcqQuestionSchema);
