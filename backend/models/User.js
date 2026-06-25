const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    progress: {
      completed_C: { type: [Number], default: [] },
      completed_Cpp: { type: [Number], default: [] },
      completed_Java: { type: [Number], default: [] },
      completed_Python: { type: [Number], default: [] },
      total_quizzes_taken: { type: Number, default: 0 },
      total_study_time: { type: Number, default: 0 },
      current_streak: { type: Number, default: 1 },
      last_active_date: { type: String, default: "" }
    },
    resetPasswordOTP: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);

