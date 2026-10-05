const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const { handlePlaygroundSocket } = require('./routes/playground_socket');

require('dotenv').config();

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const progressRoutes = require('./routes/progress');
const flashcardsRoutes = require('./routes/flashcards');
const mcqsRoutes = require('./routes/mcqs');
const leaderboardRoutes = require('./routes/leaderboard');
const playgroundRoutes = require('./routes/playground');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

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

server.on('upgrade', (request, socket, head) => {
  try {
    const pathname = new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname;
    if (pathname === '/api/playground/interactive') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch (err) {
    socket.destroy();
  }
});

wss.on('connection', (ws) => {
  handlePlaygroundSocket(ws);
});

server.listen(process.env.PORT || 5000, '0.0.0.0', () => {
  console.log('Server Started');
});