const express = require('express');
const router = express.Router();
const McqQuestion = require('../models/McqQuestion');

// ================= GET MCQ QUESTIONS BY LANGUAGE AND LEVEL =================
router.get('/', async (req, res) => {
  try {
    const { language, level } = req.query;
    if (!language || !level) {
      return res.status(400).json({ message: 'Language and level parameters are required' });
    }

    const questions = await McqQuestion.find({ language, level });
    res.status(200).json(questions);
  } catch (error) {
    console.error('Get MCQs error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
