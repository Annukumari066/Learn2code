const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    language: {
      type: String,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    code: {
      type: String
    },
    link: {
      type: String
    },
    index: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Flashcard', flashcardSchema);
