const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const auth = require('../middleware/auth');

// ================= GET ALL NOTES =================
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ================= CREATE A NOTE =================
router.post('/', auth, async (req, res) => {
  try {
    const { lang, title, content, createdAtString } = req.body;

    if (!lang || !title || !content || !createdAtString) {
      return res.status(400).json({ message: 'All note fields are required' });
    }

    const note = new Note({
      userId: req.user._id,
      lang,
      title,
      content,
      createdAtString
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ================= UPDATE A NOTE =================
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, createdAtString } = req.body;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (createdAtString !== undefined) note.createdAtString = createdAtString;

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ================= DELETE A NOTE =================
router.delete('/:id', auth, async (req, res) => {
  try {
    const noteId = req.params.id;

    const note = await Note.findOneAndDelete({ _id: noteId, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
