const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  category:     { type: String, required: true },
  date:         { type: String, required: true },
  location:     { type: String, required: true },
  neighborhood: { type: String, default: '' },
  city:         { type: String, default: 'Bangalore' },
  lat:          { type: Number, required: true },
  lng:          { type: Number, required: true },
  host:         { type: String, required: true },
  hostInit:     { type: String, required: true },
  attendees:    { type: Number, default: 0 },
  maxAtt:       { type: Number, required: true },
  xp:           { type: Number, required: true },
  fee:          { type: Number, default: 0 },
  desc:         { type: String, required: true },
  color:        { type: String, default: '#F63B05' },
  imageEmoji:   { type: String, default: '⚡' },
  tags:         [{ type: String }],
  createdAt:    { type: Date, default: Date.now }
});

// Full-text index for search
EventSchema.index({ title: 'text', location: 'text', neighborhood: 'text', tags: 'text', desc: 'text' });

module.exports = mongoose.model('Event', EventSchema);
