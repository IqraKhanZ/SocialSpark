const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  email:           { type: String, required: true, unique: true },
  password:        { type: String, default: null },        // null for Google-only accounts
  googleId:        { type: String, default: null },        // Google OAuth ID
  avatar:          { type: String, default: null },        // Profile photo URL from Google
  interests:       [{ type: String }],
  xp:              { type: Number, default: 0 },
  level:           { type: Number, default: 1 },
  joinedEvents:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  verifiedEvents:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  streakDays:      { type: Number, default: 0 },
  lastVerifiedDate:{ type: String, default: null },        // YYYY-MM-DD
  city:            { type: String, default: 'Bangalore' },
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
