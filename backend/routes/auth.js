const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


// ================= REGISTER =================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'All fields required'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// ================= LOGIN =================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'All fields required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: 'User not found',
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid password',
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// ================= PROFILE =================
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findOne().select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'No user found',
      });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


// ================= ME =================
router.get('/me', async (req, res) => {
  try {
    const token =
      req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'No token',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.id
    ).select('-password');

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;

