const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// JWT helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

// Sign Up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, interests } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists. Please sign in.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      interests: interests || [],
      xp: 0,
      level: 1
    });

    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, interests: user.interests }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account found with that email.' });
    if (!user.password) return res.status(400).json({ message: 'This account uses Google Sign-In. Please use the Google button.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password.' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, interests: user.interests }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth — Trigger
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth — Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}?auth_error=true` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    // Pass ?new=1 if this is a brand-new user with no interests set
    const isNew = req.user._isNew || (req.user.interests && req.user.interests.length === 0);
    res.redirect(`${clientUrl}?token=${token}${isNew ? '&new=1' : ''}`);
  }
);

module.exports = router;
