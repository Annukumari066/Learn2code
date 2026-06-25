const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const progressRoutes = require('./routes/progress');
const flashcardsRoutes = require('./routes/flashcards');
const mcqsRoutes = require('./routes/mcqs');
const leaderboardRoutes = require('./routes/leaderboard');
const playgroundRoutes = require('./routes/playground');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/flashcards', flashcardsRoutes);
app.use('/api/mcqs', mcqsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/playground', playgroundRoutes);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Backend Running');
});

app.listen(process.env.PORT || 5000, '0.0.0.0', () => {
  console.log('Server Started');
});