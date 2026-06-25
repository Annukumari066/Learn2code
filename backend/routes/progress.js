const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ================= GET USER PROGRESS =================
router.get('/', auth, async (req, res) => {
  try {
    res.status(200).json(req.user.progress || {});
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE/SYNC USER PROGRESS =================
router.put('/', auth, async (req, res) => {
  try {
    const {
      completed_C,
      completed_Cpp,
      completed_Java,
      completed_Python,
      total_quizzes_taken,
      total_study_time,
      current_streak,
      last_active_date
    } = req.body;

    const user = req.user;
    if (!user.progress) {
      user.progress = {};
    }

    if (completed_C !== undefined) user.progress.completed_C = completed_C;
    if (completed_Cpp !== undefined) user.progress.completed_Cpp = completed_Cpp;
    if (completed_Java !== undefined) user.progress.completed_Java = completed_Java;
    if (completed_Python !== undefined) user.progress.completed_Python = completed_Python;
    if (total_quizzes_taken !== undefined) user.progress.total_quizzes_taken = total_quizzes_taken;
    if (total_study_time !== undefined) user.progress.total_study_time = total_study_time;
    if (current_streak !== undefined) user.progress.current_streak = current_streak;
    if (last_active_date !== undefined) user.progress.last_active_date = last_active_date;

    await user.save();
    res.status(200).json(user.progress);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
