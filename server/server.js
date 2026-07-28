const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes  = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes  = require('./routes/users');
const seedDatabase = require('./seed');

const passport = require('passport');
require('./passport');

const app = express();

// CORS — allow Vite dev server and production client
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth',   authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users',  userRoutes);

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' })
);

// ── START SERVER IMMEDIATELY (don't wait for DB) ───────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ── Connect to MongoDB separately ─────────────────────────────────
const DB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/socialspark';

mongoose.connect(DB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas.');
    await seedDatabase();
  })
  .catch((err) => {
    console.warn('⚠️  MongoDB connection failed — running in offline/demo mode.');
    console.warn('   Cause:', err.message);
    console.warn('   Fix: Whitelist your IP in MongoDB Atlas → Network Access.');
  });
