const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 🧾 POST /api/users/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, name } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required for registration' });
    }

    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const user = new User({ username: username.trim(), name: name.trim() });
    await user.save();

    res.status(201).json({ user, message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ POST /users/register error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// 🔐 POST /api/users/login - Login existing user
router.post('/login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    res.status(200).json({ user, message: 'Login successful' });
  } catch (err) {
    console.error('❌ POST /users/login error:', err.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// 🔐 POST /api/users/save-token - Save FCM token
router.post('/save-token', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: 'User ID and token are required.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken: token },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ message: 'Token saved successfully.' });
  } catch (err) {
    console.error('❌ POST /users/save-token error:', err.message);
    res.status(500).json({ error: 'Failed to save token.' });
  }
});


// 🧾 GET /api/users - Get all users (optional for debugging/admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ username: 1 });
    res.status(200).json(users);
  } catch (err) {
    console.error('❌ GET /users error:', err.message);
    res.status(500).json({ error: 'Could not fetch users. Server error.' });
  }
});

module.exports = router;
