const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const mockUsers = [
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    progress: {
      completed_C: [1, 2, 3],
      completed_Cpp: [1, 2],
      completed_Java: [1],
      completed_Python: [1, 2, 3, 4],
      total_quizzes_taken: 45,
      total_study_time: 15400, // ~256 mins
      current_streak: 12,
      last_active_date: '2026-06-20'
    }
  },
  {
    name: 'Bob Smith',
    email: 'bob@example.com',
    progress: {
      completed_C: [1],
      completed_Cpp: [],
      completed_Java: [],
      completed_Python: [1, 2],
      total_quizzes_taken: 15,
      total_study_time: 4200, // ~70 mins
      current_streak: 4,
      last_active_date: '2026-06-19'
    }
  },
  {
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    progress: {
      completed_C: [1, 2],
      completed_Cpp: [1, 2, 3],
      completed_Java: [1, 2, 3, 4, 5],
      completed_Python: [1],
      total_quizzes_taken: 32,
      total_study_time: 11200, // ~186 mins
      current_streak: 8,
      last_active_date: '2026-06-20'
    }
  },
  {
    name: 'Diana Prince',
    email: 'diana@example.com',
    progress: {
      completed_C: [1, 2, 3, 4, 5],
      completed_Cpp: [1, 2, 3, 4, 5],
      completed_Java: [1, 2, 3, 4, 5],
      completed_Python: [1, 2, 3, 4, 5],
      total_quizzes_taken: 85,
      total_study_time: 32000, // ~533 mins
      current_streak: 25,
      last_active_date: '2026-06-20'
    }
  },
  {
    name: 'Evan Wright',
    email: 'evan@example.com',
    progress: {
      completed_C: [],
      completed_Cpp: [1],
      completed_Java: [1, 2],
      completed_Python: [],
      total_quizzes_taken: 10,
      total_study_time: 3000, // ~50 mins
      current_streak: 2,
      last_active_date: '2026-06-18'
    }
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('Inserting mock users...');
    for (const u of mockUsers) {
      // Avoid inserting duplicate emails
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`User ${u.email} already exists, updating progress...`);
        existing.progress = u.progress;
        await existing.save();
      } else {
        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          progress: u.progress
        });
        console.log(`Created user ${u.name}`);
      }
    }

    console.log('\n🎉 LEADERBOARD USERS SEEDING COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

seed();
