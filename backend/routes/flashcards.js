const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');

// ================= GET FLASHCARDS BY LANGUAGE =================
router.get('/', async (req, res) => {
  try {
    const { language } = req.query;
    if (!language) {
      return res.status(400).json({ message: 'Language parameter is required' });
    }

    // Sort by index if present to maintain card order
    const flashcards = await Flashcard.find({ language }).sort({ index: 1 });
    res.status(200).json(flashcards);
  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
