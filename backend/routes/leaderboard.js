const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// ================= GET LEADERBOARD =================
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'name progress');
    
    const leaderboard = users.map(user => {
      const completedCount = 
        (user.progress?.completed_C?.length || 0) +
        (user.progress?.completed_Cpp?.length || 0) +
        (user.progress?.completed_Java?.length || 0) +
        (user.progress?.completed_Python?.length || 0);

      const studyMinutes = Math.floor((user.progress?.total_study_time || 0) / 60);

      const points = 
        completedCount * 100 + 
        (user.progress?.total_quizzes_taken || 0) * 10 + 
        (user.progress?.current_streak || 0) * 50 +
        studyMinutes * 2;

      return {
        _id: user._id,
        name: user.name,
        points,
        streak: user.progress?.current_streak || 0,
        quizzes: user.progress?.total_quizzes_taken || 0,
        studyTime: studyMinutes
      };
    });

    // Sort descending by points
    leaderboard.sort((a, b) => b.points - a.points);

    // Find requesting user rank
    const userIndex = leaderboard.findIndex(item => item._id.toString() === req.user._id.toString());
    const userRank = userIndex !== -1 ? userIndex + 1 : null;
    const userPoints = userIndex !== -1 ? leaderboard[userIndex].points : 0;

    // Slice top 20 for returning
    const topUsers = leaderboard.slice(0, 20);

    res.status(200).json({
      leaderboard: topUsers,
      currentUser: {
        rank: userRank,
        points: userPoints,
        name: req.user.name,
        streak: req.user.progress?.current_streak || 0,
        quizzes: req.user.progress?.total_quizzes_taken || 0,
        studyTime: Math.floor((req.user.progress?.total_study_time || 0) / 60)
      }
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
