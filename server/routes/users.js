const express = require('express');
const User    = require('../models/User');
const auth    = require('../middleware/auth');
const router  = express.Router();

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/profile — update interests / other fields
router.post('/profile', auth, async (req, res) => {
  try {
    const { interests, city } = req.body;
    const updates = {};
    if (interests) updates.interests = interests;
    if (city)      updates.city = city;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({}).sort({ xp: -1 }).limit(10).select('name xp level avatar');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
