const express = require('express');
const Event   = require('../models/Event');
const User    = require('../models/User');
const auth    = require('../middleware/auth');
const router  = express.Router();

// ─── Helper: Haversine distance in meters ───────────────────────────
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const dPhi = (lat2 - lat1) * Math.PI / 180;
  const dLam = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dPhi/2)**2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m away`;
  return `${(meters / 1000).toFixed(1)}km away`;
}

// ─── GET /api/events — All events ───────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({}).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/events/search — AI Location-aware search ──────────────
// Query params: q (text), category, lat, lng, radius (meters, default 5000)
router.get('/search', async (req, res) => {
  try {
    const { q, category, lat, lng, radius = 10000 } = req.query;
    let query = {};

    // Text search
    if (q && q.trim()) {
      query.$or = [
        { title:        { $regex: q, $options: 'i' } },
        { location:     { $regex: q, $options: 'i' } },
        { neighborhood: { $regex: q, $options: 'i' } },
        { tags:         { $regex: q, $options: 'i' } },
        { desc:         { $regex: q, $options: 'i' } },
        { host:         { $regex: q, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    let events = await Event.find(query);

    // Proximity sort — if user coordinates provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const rad     = parseFloat(radius);

      events = events
        .map(ev => {
          const dist = getDistance(userLat, userLng, ev.lat, ev.lng);
          return { ...ev.toObject(), distanceMeters: dist, distanceLabel: formatDistance(dist) };
        })
        .filter(ev => ev.distanceMeters <= rad)
        .sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/events/:id/join ───────────────────────────────────────
router.post('/:id/join', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const user = await User.findById(req.user.id);
    if (user.joinedEvents.map(String).includes(String(event._id))) {
      return res.status(400).json({ message: 'You have already joined this event.' });
    }

    user.joinedEvents.push(event._id);
    event.attendees += 1;
    await user.save();
    await event.save();

    res.json({ message: 'Successfully joined event!', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/events/:id/verify-attendance ──────────────────────────
router.post('/:id/verify-attendance', auth, async (req, res) => {
  try {
    const { userLat, userLng } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const user = await User.findById(req.user.id);
    if (user.verifiedEvents.map(String).includes(String(event._id))) {
      return res.status(400).json({ message: 'Attendance already verified for this event.' });
    }

    const distance   = getDistance(userLat, userLng, event.lat, event.lng);
    const maxDistance = parseFloat(process.env.MAX_SCAN_DISTANCE_METERS || '100');

    if (distance > maxDistance) {
      return res.status(400).json({
        message: `You are ${Math.round(distance)}m from the venue. Must be within ${maxDistance}m to check in.`
      });
    }

    // Award XP
    user.verifiedEvents.push(event._id);
    user.xp    += event.xp;
    user.level  = Math.floor(user.xp / 500) + 1;

    // Streak logic
    const todayStr = new Date().toISOString().split('T')[0];
    if (user.lastVerifiedDate) {
      const diffDays = Math.ceil(
        Math.abs(new Date(todayStr) - new Date(user.lastVerifiedDate)) / (1000 * 60 * 60 * 24)
      );
      user.streakDays = diffDays === 1 ? user.streakDays + 1 : 1;
    } else {
      user.streakDays = 1;
    }
    user.lastVerifiedDate = todayStr;

    await user.save();
    res.json({ message: 'Attendance verified!', xpAwarded: event.xp, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
