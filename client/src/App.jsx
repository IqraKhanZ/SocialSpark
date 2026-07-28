import React, { useState, useEffect, useCallback } from 'react';
import {
  Home, Search, QrCode, Gift, User, Bell, Award,
  MapPin, Clock, ArrowLeft, Check, LogOut, Zap,
  Users, Navigation, X, ChevronRight, Star
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// ─── Helpers ────────────────────────────────────────────────────────
const getCatIcon = (cat) => {
  const map = { Arts: '🖼️', Games: '♟️', Food: '🍳', Music: '🎵', Sports: '🏃', Volunteer: '🤝', Reading: '📚', Tech: '💻' };
  return map[cat] || '⚡';
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── Google SVG ──────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15.01.5 12 .5 7.37.5 3.44 3.17 1.54 7.06l3.89 3.02C6.34 7.23 8.94 5.04 12 5.04z"/>
    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.75-4.87 3.75-8.49z"/>
    <path fill="#FBBC05" d="M5.43 14.12a6.85 6.85 0 0 1 0-4.38L1.54 6.72A11.458 11.458 0 0 0 .5 12c0 1.89.47 3.67 1.04 5.28l3.89-3.16z"/>
    <path fill="#34A853" d="M12 23.5c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.08-4.3 1.08-3.06 0-5.66-2.19-6.57-5.14L1.54 16.7c1.9 3.89 5.83 6.8 10.46 6.8z"/>
  </svg>
);

// ─── Avatar Component ─────────────────────────────────────────────────
const Avatar = ({ user, size = 36, className = '' }) => {
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (user?.avatar) {
    return (
      <div className={`profile-avatar ${className}`} style={style}>
        <img src={user.avatar} alt={user.name} onError={(e) => { e.target.style.display = 'none'; }} />
        {user.name?.[0]?.toUpperCase()}
      </div>
    );
  }
  return (
    <div className={`profile-avatar ${className}`} style={style}>
      {user?.name?.[0]?.toUpperCase() || 'S'}
    </div>
  );
};

// ─── Main App ──────────────────────────────────────────────────────────
export default function App() {
  // Navigation
  const [screen, setScreen] = useState('s-home');

  // Auth
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user,  setUser]  = useState(null);
  const [authMode, setAuthMode] = useState('login');

  // Auth form
  const [loginEmail,    setLoginEmail]    = useState('mahib@socialspark.in');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [signupName,    setSignupName]    = useState('');
  const [signupEmail,   setSignupEmail]   = useState('');
  const [signupPassword,setSignupPassword] = useState('');
  const [authLoading,   setAuthLoading]   = useState(false);

  // Data
  const [events,      setEvents]      = useState([]);
  const [volunteers,  setVolunteers]  = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Interests
  const [selectedInterests, setSelectedInterests] = useState(new Set());

  // Explore
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [searchResults,  setSearchResults]  = useState(null); // null = not searched yet
  const [nearbyActive,   setNearbyActive]   = useState(false);
  const [userCoords,     setUserCoords]     = useState(null);
  const [searchLoading,  setSearchLoading]  = useState(false);

  // Event detail modal
  const [currentEventId, setCurrentEventId] = useState(null);
  const [isDetailOpen,   setIsDetailOpen]   = useState(false);

  // QR
  const [qrPattern, setQrPattern]  = useState([]);
  const [qrStep,    setQrStep]     = useState('scan');
  const [xpAwarded, setXpAwarded]  = useState(50);

  // Toast
  const [toastMsg,  setToastMsg]  = useState('');
  const [showToast, setShowToast] = useState(false);

  // ─── Toast helper ─────────────────────────────────────────────────
  const toast = useCallback((msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // ─── Static data ──────────────────────────────────────────────────
  const interestsList = [
    { label: 'Photography', icon: '📷' }, { label: 'Football', icon: '⚽' },
    { label: 'Cooking',     icon: '🍳' }, { label: 'Coding',   icon: '💻' },
    { label: 'Yoga',        icon: '🧘' }, { label: 'Music',    icon: '🎸' },
    { label: 'Reading',     icon: '📚' }, { label: 'Volunteer',icon: '🤝' }
  ];

  const rewardStoreList = [
    { title: 'Free Coffee',       partner: 'Third Wave Coffee',      cost: 200, color: '#92400E', icon: '☕' },
    { title: 'Movie Ticket',      partner: 'PVR Cinemas',            cost: 500, color: '#1D4ED8', icon: '🎟️' },
    { title: 'Gym Day Pass',      partner: 'Cult Fit',               cost: 300, color: '#065F46', icon: '💪' },
    { title: '10% Dining',        partner: 'Partner Restaurants',    cost: 150, color: '#991B1B', icon: '🍽️' },
    { title: 'Workshop Discount', partner: 'SocialSpark Events',     cost: 400, color: '#6B21A8', icon: '🎓' },
  ];

  // ─── Google OAuth token intercept ──────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get('token');
    const isNew      = params.get('new') === '1';   // server can pass ?new=1 for new Google users
    const authError   = params.get('auth_error');

    if (googleToken) {
      setToken(googleToken);
      localStorage.setItem('token', googleToken);
      if (isNew) setScreen('s-interests');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (authError) {
      toast('Google sign-in failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  // ─── Load app data when token changes ──────────────────────────────
  useEffect(() => {
    if (token) {
      loadAppData();
    } else {
      loadOfflineData();
    }
  }, [token]); // eslint-disable-line

  const loadAppData = async (opts = {}) => {
    try {
      const [userRes, eventsRes, lbRes] = await Promise.all([
        fetch(`${API_URL}/users/profile`,    { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/events`),
        fetch(`${API_URL}/users/leaderboard`)
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
        // ── Onboarding gate: redirect new users to interests screen ──
        if (!opts.skipOnboarding && (!userData.interests || userData.interests.length === 0)) {
          setScreen('s-interests');
        }
      }
      if (eventsRes.ok) {
        const ev = await eventsRes.json();
        setEvents(ev);
        setVolunteers(ev.filter(e => e.category === 'Volunteer'));
      }
      if (lbRes.ok) setLeaderboard(await lbRes.json());
    } catch {
      toast('Server offline — showing demo data.');
      loadOfflineData();
    }
  };

  const loadOfflineData = () => {
    setUser({ name: 'Mahib Khan', xp: 1240, level: 3, streakDays: 5, joinedEvents: [], verifiedEvents: [], avatar: null });
    const demo = [
      { _id: '1', title: 'Photography Walk',  category: 'Arts',      date: 'Sat · 5:00 PM', location: 'Cubbon Park, Bangalore',           host: 'Riya Sharma',         hostInit: 'R', attendees: 12, maxAtt: 20, xp: 50,  fee: 0,   desc: 'Guided photography walk in Cubbon Park.',   color: '#E63946', imageEmoji: '📷', lat: 12.9734, lng: 77.5912 },
      { _id: '2', title: 'Chess Evening',     category: 'Games',     date: 'Wed · 7:00 PM', location: 'The Book Café, Indiranagar',       host: 'Aryan Kapoor',        hostInit: 'A', attendees: 8,  maxAtt: 16, xp: 50,  fee: 0,   desc: 'Weekly chess night for all levels.',        color: '#3B82F6', imageEmoji: '♟️', lat: 12.9784, lng: 77.6408 },
      { _id: '3', title: 'HSR Lake Cleanup',  category: 'Volunteer', date: 'Sun · 7:00 AM', location: 'HSR Lake, HSR Layout',             host: 'Clean Bangalore',     hostInit: 'C', attendees: 28, maxAtt: 50, xp: 150, fee: 0,   desc: 'Plant trees & clean lake trails.',          color: '#22C55E', imageEmoji: '🌿', lat: 12.9119, lng: 77.6384 },
      { _id: '4', title: 'Open Mic Night',    category: 'Music',     date: 'Fri · 8:00 PM', location: 'The Humming Tree, Indiranagar',   host: 'Humming Tree Events', hostInit: 'H', attendees: 32, maxAtt: 60, xp: 70,  fee: 200, desc: 'Bangalore\'s most beloved open mic night!', color: '#F97316', imageEmoji: '🎵', lat: 12.9793, lng: 77.6378 },
      { _id: '5', title: 'Sunday Football',   category: 'Sports',    date: 'Sun · 6:30 AM', location: 'Yelahanka Sports Ground',         host: 'BLR Kickabouts',      hostInit: 'B', attendees: 14, maxAtt: 22, xp: 80,  fee: 100, desc: 'Casual 7-a-side football every Sunday.',   color: '#10B981', imageEmoji: '⚽', lat: 13.1005, lng: 77.5963 },
      { _id: '6', title: 'Book Club: Sci-Fi', category: 'Reading',   date: 'Thu · 7:00 PM', location: 'Atta Galatta, Koramangala',       host: 'Atta Galatta',        hostInit: 'A', attendees: 11, maxAtt: 20, xp: 40,  fee: 0,   desc: 'Monthly sci-fi book club discussion.',      color: '#0EA5E9', imageEmoji: '📚', lat: 12.9346, lng: 77.6259 },
    ];
    setEvents(demo);
    setVolunteers(demo.filter(e => e.category === 'Volunteer'));
    setLeaderboard([
      { name: 'Neha Joshi',  xp: 2840, level: 6 },
      { name: 'Karan Bhat',  xp: 2610, level: 6 },
      { name: 'Dev Singh',   xp: 2190, level: 5 },
      { name: 'Mahib Khan',  xp: 1240, level: 3, me: true }
    ]);
  };

  // ─── Auth handlers ────────────────────────────────────────────────
  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setToken(data.token);
      localStorage.setItem('token', data.token);
      toast(`Welcome back, ${data.user.name}! 👋`);
      setScreen('s-home');
    } catch (err) {
      toast(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async () => {
    setAuthLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setToken(data.token);
      localStorage.setItem('token', data.token);
      toast('Account created! Pick your interests. 🎉');
      setScreen('s-interests');
    } catch (err) {
      toast(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    toast('Logged out. See you soon!');
    setScreen('s-home');
  };

  // ─── Interests ────────────────────────────────────────────────────
  const toggleInterest = (label) => {
    const next = new Set(selectedInterests);
    next.has(label) ? next.delete(label) : next.add(label);
    setSelectedInterests(next);
  };

  const saveInterests = async () => {
    if (selectedInterests.size < 3) return;
    try {
      if (token) {
        await fetch(`${API_URL}/users/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ interests: Array.from(selectedInterests) })
        });
      }
      // Pass skipOnboarding so saving interests doesn't re-trigger the onboarding gate
      await loadAppData({ skipOnboarding: true });
    } catch {}
    setScreen('s-home');
  };

  // ─── Events ───────────────────────────────────────────────────────
  const openEventDetails = (id) => {
    setCurrentEventId(id);
    setIsDetailOpen(true);
  };

  const closeEventDetails = () => setIsDetailOpen(false);

  const joinEvent = async (eventId) => {
    if (!token) {
      toast('Sign in to join events!');
      return;
    }
    try {
      const res  = await fetch(`${API_URL}/events/${eventId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast('Joined! Show up and scan in. 📍');
      loadAppData();
    } catch (err) {
      // Offline fallback
      const updated = { ...user };
      if (!updated.joinedEvents) updated.joinedEvents = [];
      updated.joinedEvents.push(eventId);
      setUser(updated);
      toast(err.message || 'Joined event (demo mode)!');
    }
  };

  // ─── Proximity Search ────────────────────────────────────────────
  const handleNearbyToggle = () => {
    if (nearbyActive) {
      setNearbyActive(false);
      setUserCoords(null);
      setSearchResults(null);
      return;
    }
    if (!navigator.geolocation) {
      toast('Location not supported on this browser.');
      return;
    }
    toast('Acquiring GPS...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setNearbyActive(true);
        runSearch(searchQuery, activeCategory, coords);
      },
      () => toast('Could not get location. Check permissions.')
    );
  };

  const runSearch = useCallback(async (q, cat, coords) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      if (q)   params.set('q', q);
      if (cat && cat !== 'All') params.set('category', cat);
      if (coords) {
        params.set('lat', coords.lat);
        params.set('lng', coords.lng);
        params.set('radius', 20000);
      }
      const res = await fetch(`${API_URL}/events/search?${params}`);
      if (res.ok) {
        setSearchResults(await res.json());
      }
    } catch {
      // Offline fallback — filter locally
      const filtered = events
        .filter(ev => cat === 'All' || ev.category === cat)
        .filter(ev => !q || ev.title.toLowerCase().includes(q.toLowerCase()) || ev.location.toLowerCase().includes(q.toLowerCase()));
      setSearchResults(filtered);
    } finally {
      setSearchLoading(false);
    }
  }, [events]);

  // Debounced search on query/category change
  useEffect(() => {
    if (screen !== 's-explore') return;
    const t = setTimeout(() => {
      if (searchQuery || activeCategory !== 'All' || nearbyActive) {
        runSearch(searchQuery, activeCategory, nearbyActive ? userCoords : null);
      } else {
        setSearchResults(null);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, activeCategory]); // eslint-disable-line

  // ─── QR ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen === 's-qr') {
      setQrStep('scan');
      const p = [];
      for (let i = 0; i < 49; i++) p.push(Math.random() > 0.45);
      setQrPattern(p);
    }
  }, [screen]);

  const verifyAttendance = () => {
    if (!navigator.geolocation) { toast('Location not supported.'); return; }
    toast('Acquiring GPS coordinates...');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res  = await fetch(`${API_URL}/events/${currentEventId}/verify-attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userLat: pos.coords.latitude, userLng: pos.coords.longitude })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setXpAwarded(data.xpAwarded);
        setQrStep('success');
        loadAppData();
      } catch (err) {
        toast(err.message || 'Attendance validation failed.');
        setXpAwarded(50);
        setQrStep('success');
      }
    }, () => toast('Could not get GPS location.'));
  };

  // ─── Calculations ─────────────────────────────────────────────────
  const xp             = user?.xp || 0;
  const level          = user?.level || 1;
  const nextLevelXP    = level * 500;
  const currentMinXP   = (level - 1) * 500;
  const progressPct    = Math.min(100, ((xp - currentMinXP) / 500) * 100);
  const selectedEvent  = events.find(e => e._id === currentEventId);
  const displayedEvents = searchResults !== null ? searchResults : events;

  // ─── Interest → Category mapping ──────────────────────────────────
  const INTEREST_TO_CATEGORY = {
    Photography: ['Arts'],
    Football:    ['Sports'],
    Cooking:     ['Food'],
    Coding:      ['Tech'],
    Yoga:        ['Sports', 'Wellness'],
    Music:       ['Music'],
    Reading:     ['Reading'],
    Volunteer:   ['Volunteer'],
    Gaming:      ['Games'],
    Art:         ['Arts'],
    Dance:       ['Arts', 'Music'],
    Travel:      ['Arts', 'Sports'],
  };

  const userInterests = user?.interests || [];

  // Filter events that match at least one of the user's interests
  const recommendedEvents = userInterests.length === 0
    ? events   // no interests set yet — show everything as fallback
    : events.filter(ev => {
        return userInterests.some(interest => {
          const matchedCategories = INTEREST_TO_CATEGORY[interest] || [interest];
          return matchedCategories.some(cat =>
            ev.category?.toLowerCase() === cat.toLowerCase() ||
            (ev.tags || []).some(tag => tag.toLowerCase() === interest.toLowerCase())
          );
        });
      });

  // Explore filter (when no server search)
  const filteredExplore = (searchResults !== null ? searchResults : events)
    .filter(ev => activeCategory === 'All' || ev.category === activeCategory)
    .filter(ev => !searchQuery || ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.location.toLowerCase().includes(searchQuery.toLowerCase()));

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════

  // ── Auth Screen ───────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="auth-root">
        {/* Left Hero (Desktop only) */}
        <div className="auth-hero">
          <div className="auth-hero-content">
            <div className="hero-logo">
              <div className="hero-logo-icon">
                <svg viewBox="0 0 24 24"><path fill="white" d="M13 2L4.5 13.5H11L10 22L20.5 9H14L13 2z"/></svg>
              </div>
              <div className="hero-logo-text">Social<span>Spark</span></div>
            </div>
            <div className="hero-tagline">
              Discover local events,<br />earn XP, build real connections.
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><div className="hero-stat-num">12K+</div><div className="hero-stat-lbl">Sparkers</div></div>
              <div className="hero-stat"><div className="hero-stat-num">850+</div><div className="hero-stat-lbl">Events</div></div>
              <div className="hero-stat"><div className="hero-stat-num">48</div><div className="hero-stat-lbl">Cities</div></div>
            </div>
            <div className="hero-events-preview">
              {[
                { emoji: '📷', bg: 'rgba(230,57,70,0.2)', title: 'Photography Walk', meta: 'Cubbon Park · Sat 5 PM', xp: '+50 XP' },
                { emoji: '🎵', bg: 'rgba(249,115,22,0.2)', title: 'Open Mic Night', meta: 'Indiranagar · Fri 8 PM', xp: '+70 XP' },
                { emoji: '🌿', bg: 'rgba(34,197,94,0.2)', title: 'Lake Cleanup', meta: 'HSR Layout · Sun 7 AM', xp: '+150 XP' },
              ].map((e, i) => (
                <div className="hero-event-pill" key={i}>
                  <div className="hero-ep-icon" style={{ background: e.bg }}>{e.emoji}</div>
                  <div>
                    <div className="hero-ep-title">{e.title}</div>
                    <div className="hero-ep-meta">{e.meta}</div>
                  </div>
                  <div className="hero-ep-xp">{e.xp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          {/* Mobile logo */}
          <div className="auth-mobile-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24"><path fill="white" d="M13 2L4.5 13.5H11L10 22L20.5 9H14L13 2z"/></svg>
            </div>
            <div className="logo-text">Social<span>Spark</span></div>
          </div>

          {authMode === 'login' ? (
            <>
              <div className="auth-header">
                <div className="auth-title">Welcome back 👋</div>
                <div className="auth-subtitle">Sign in to continue your journey.</div>
              </div>

              <button className="btn-google" onClick={handleGoogleLogin}>
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="or-divider">or</div>

              <div className="auth-field">
                <label>Email Address</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <button className="btn-primary" onClick={handleLogin} disabled={authLoading}>
                {authLoading ? <span className="spinner" /> : 'Sign In'}
              </button>

              <p className="auth-switch">
                Don't have an account?{' '}
                <span className="auth-switch-link" onClick={() => setAuthMode('signup')}>Create one</span>
              </p>
            </>
          ) : (
            <>
              <div className="auth-header">
                <div className="auth-title">Create account ✨</div>
                <div className="auth-subtitle">Start connecting in the real world.</div>
              </div>

              <button className="btn-google" onClick={handleGoogleLogin}>
                <GoogleIcon />
                Sign up with Google
              </button>

              <div className="or-divider">or</div>

              <div className="auth-field">
                <label>Full Name</label>
                <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="Mahib Khan" />
              </div>
              <div className="auth-field">
                <label>Email Address</label>
                <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} placeholder="Min. 8 characters" />
              </div>

              <button className="btn-primary" onClick={handleSignup} disabled={authLoading}>
                {authLoading ? <span className="spinner" /> : 'Create Account'}
              </button>

              <p className="auth-switch">
                Already have an account?{' '}
                <span className="auth-switch-link" onClick={() => setAuthMode('login')}>Sign In</span>
              </p>
            </>
          )}
        </div>

        {/* Toast */}
        <div className={`toast ${showToast ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    );
  }

  // ── Interests Onboarding ──────────────────────────────────────────
  if (screen === 's-interests') {
    return (
      <div className="onb-root">
        <div className="onb-step">Step 2 of 2</div>
        <div className="onb-title">What are you<br />into?</div>
        <div className="onb-sub">Pick at least 3 interests — we'll personalise your event feed.</div>

        <div className="interests-grid">
          {interestsList.map(item => (
            <div
              key={item.label}
              className={`interest-tag ${selectedInterests.has(item.label) ? 'selected' : ''}`}
              onClick={() => toggleInterest(item.label)}
            >
              <span className="interest-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div className="onb-counter">
          {selectedInterests.size < 3
            ? `Select ${3 - selectedInterests.size} more`
            : `${selectedInterests.size} selected ✓`}
        </div>

        <button
          className="btn-primary"
          disabled={selectedInterests.size < 3}
          onClick={saveInterests}
          style={{ opacity: selectedInterests.size < 3 ? 0.5 : 1 }}
        >
          Find My Events →
        </button>

        <div className={`toast ${showToast ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    );
  }

  // ── Main App Shell ─────────────────────────────────────────────────
  const navItems = [
    { id: 's-home',        label: 'Home',      Icon: Home  },
    { id: 's-explore',     label: 'Explore',   Icon: Search },
    { id: 's-qr',          label: 'Check In',  Icon: QrCode, center: true },
    { id: 's-rewards',     label: 'Rewards',   Icon: Gift  },
    { id: 's-leaderboard', label: 'Ranks',     Icon: Award },
    { id: 's-profile',     label: 'Profile',   Icon: User  },
  ];

  return (
    <div className="app-root">
      {/* ── Sidebar (Desktop) ───────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24"><path fill="white" d="M13 2L4.5 13.5H11L10 22L20.5 9H14L13 2z"/></svg>
          </div>
          <div className="logo-text">Social<span>Spark</span></div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ id, label, Icon, center }) => (
            center
              ? (
                <button
                  key={id}
                  className="sidebar-center-btn"
                  onClick={() => setScreen(id)}
                >
                  <Icon size={18} />
                  <span className="s-label">{label}</span>
                </button>
              )
              : (
                <button
                  key={id}
                  className={`sidebar-btn ${screen === id ? 'active' : ''}`}
                  onClick={() => setScreen(id)}
                >
                  <Icon size={18} />
                  <span className="s-label">{label}</span>
                </button>
              )
          ))}
        </nav>

        {/* Sidebar user card */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.avatar
              ? <img src={user.avatar} alt={user.name} />
              : user?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'Sparker'}</div>
            <div className="sidebar-user-xp">{xp} XP · Lv {level}</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="main-content">
        <div className="screen-container">

          {/* ── HOME ────────────────────────────────────────────── */}
          <section className={`screen ${screen === 's-home' ? 'active' : ''}`}>
            <div className="home-topbar">
              <div>
                <div className="home-greeting">{getGreeting()},</div>
                <div className="home-name">{user?.name?.split(' ')[0] || 'Sparker'} 👋</div>
              </div>
              <div className="notif-btn" onClick={() => toast('3 new events near you!')}>
                <Bell size={20} color="var(--text-2)" />
                <div className="notif-dot" />
              </div>
            </div>

            {/* XP Banner */}
            <div className="xp-banner">
              <div className="xp-top">
                <div>
                  <div className="xp-label">Social XP</div>
                  <div className="xp-num">{xp} <span style={{ fontSize: 14, color: 'var(--text-3)' }}>XP</span></div>
                  <div className="xp-sub">{nextLevelXP - xp} XP to Level {level + 1}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="level-badge">Level {level}</div>
                  <div className="level-role">Sparker</div>
                </div>
              </div>
              <div className="xp-bar-track">
                <div className="xp-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Weekly Quest */}
            <div className="quest-card" onClick={() => setScreen('s-leaderboard')}>
              <div className="quest-header">
                <div className="quest-title">🎯 Weekly Social Quest</div>
                <div className="badge-orange">+250 XP</div>
              </div>
              {[
                { text: 'Attend 1 event', done: true },
                { text: 'Meet someone new', done: true },
                { text: 'Volunteer this week', done: false },
              ].map((q, i) => (
                <div className="quest-item" key={i}>
                  <div className={`quest-check ${q.done ? 'done' : ''}`}>
                    {q.done && <Check size={10} color="white" strokeWidth={3} />}
                  </div>
                  <span className={`quest-item-text ${q.done ? 'done' : ''}`}>{q.text}</span>
                </div>
              ))}
            </div>

            {/* Recommended — filtered by user interests */}
            <div className="section-row">
              <div className="section-title">Recommended For You</div>
              <button className="see-all" onClick={() => setScreen('s-explore')}>See All</button>
            </div>

            {/* Interest tags row */}
            {userInterests.length > 0 && (
              <div style={{ display: 'flex', gap: 6, padding: '0 20px 12px', flexWrap: 'wrap' }}>
                {userInterests.map(interest => (
                  <span key={interest} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px',
                    borderRadius: 20, background: 'var(--accent-a15, rgba(255,107,53,0.15))',
                    color: 'var(--accent, #ff6b35)', border: '1px solid var(--accent-a30, rgba(255,107,53,0.3))'
                  }}>
                    {interest}
                  </span>
                ))}
              </div>
            )}

            {recommendedEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: 'var(--text-3)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
                <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-1)' }}>No matching events yet</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>We don't have events for your interests right now.</div>
                <button
                  className="see-all"
                  style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}
                  onClick={() => setScreen('s-explore')}
                >
                  Browse all events →
                </button>
              </div>
            ) : (
              <div className="hscroll">
                {recommendedEvents.map(ev => (
                  <div key={ev._id} className="h-event-card" onClick={() => openEventDetails(ev._id)}>
                    <div className="h-event-banner" style={{ background: `linear-gradient(135deg, ${ev.color}22, ${ev.color}44)` }}>
                      <span>{ev.imageEmoji || getCatIcon(ev.category)}</span>
                      <div className="h-xp-badge">+{ev.xp} XP</div>
                    </div>
                    <div className="h-event-body">
                      <div className="h-event-title">{ev.title}</div>
                      <div className="h-event-meta">{ev.date}</div>
                      <div className="h-event-footer">
                        <span style={{ color: 'var(--text-3)' }}>{ev.attendees}/{ev.maxAtt}</span>
                        <span style={{ color: ev.fee === 0 ? 'var(--green)' : 'var(--text-3)', fontWeight: 800 }}>
                          {ev.fee === 0 ? 'Free' : `₹${ev.fee}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Give Back */}
            <div className="section-row" style={{ paddingTop: 20 }}>
              <div className="section-title">Give Back 🤝</div>
              <button className="see-all" onClick={() => setScreen('s-explore')}>See All</button>
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {volunteers.map(ev => (
                <div key={ev._id} className="vol-card" onClick={() => openEventDetails(ev._id)}>
                  <div className="vol-icon" style={{ background: `${ev.color}22`, border: `1px solid ${ev.color}33` }}>
                    <span>{ev.imageEmoji || '🤝'}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="vol-title">{ev.title}</div>
                    <div className="vol-meta">{ev.location.split(',')[0]}  ·  {ev.date}</div>
                  </div>
                  <div className="badge-orange">+{ev.xp} XP</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── EXPLORE ──────────────────────────────────────────── */}
          <section className={`screen ${screen === 's-explore' ? 'active' : ''}`}>
            <div className="explore-header">
              <div className="explore-title">Discover Events</div>
              <div className="explore-sub">Bangalore · {events.length} events available</div>
            </div>

            {/* Search bar + Near Me */}
            <div style={{ display: 'flex', gap: 10, margin: '14px 20px 0', alignItems: 'center' }}>
              <div className="search-bar" style={{ flex: 1 }}>
                <Search size={18} color="var(--text-3)" />
                <input
                  type="text"
                  placeholder="Search events, locations, hosts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(''); setSearchResults(null); }} style={{ color: 'var(--text-3)', flexShrink: 0 }}>
                    <X size={16} />
                  </button>
                )}
              </div>
              <button className={`nearby-btn ${nearbyActive ? 'active' : ''}`} onClick={handleNearbyToggle}>
                <Navigation size={14} />
                {nearbyActive ? 'Near Me ✓' : 'Near Me'}
              </button>
            </div>

            {/* Category chips */}
            <div className="cat-scroll">
              {['All', 'Arts', 'Games', 'Food', 'Volunteer', 'Sports', 'Music', 'Reading'].map(cat => (
                <div
                  key={cat}
                  className={`chip ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat !== 'All' && getCatIcon(cat)} {cat}
                </div>
              ))}
            </div>

            {/* Results */}
            {searchLoading ? (
              <div className="search-loading">
                <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                <div style={{ marginTop: 12 }}>Finding events...</div>
              </div>
            ) : filteredExplore.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <div className="no-results-text">No events found</div>
                <div className="no-results-sub">Try a different search or category</div>
              </div>
            ) : (
              <>
                {nearbyActive && userCoords && (
                  <div style={{ padding: '10px 20px 0', fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>
                    📍 Showing events within 20km of your location
                  </div>
                )}
                <div className="events-grid">
                  {filteredExplore.map(ev => (
                    <div key={ev._id} className="grid-card" onClick={() => openEventDetails(ev._id)}>
                      <div className="grid-banner" style={{ background: `linear-gradient(135deg, ${ev.color}33, ${ev.color}55)` }}>
                        <span style={{ fontSize: 36 }}>{ev.imageEmoji || getCatIcon(ev.category)}</span>
                        <div className="grid-xp-badge">+{ev.xp} XP</div>
                      </div>
                      <div className="grid-body">
                        <div className="grid-title">{ev.title}</div>
                        <div className="grid-meta">{ev.date}</div>
                        {ev.distanceLabel && <div className="grid-dist">📍 {ev.distanceLabel}</div>}
                        <div className="grid-footer">
                          <span style={{ color: 'var(--text-3)' }}>{ev.attendees} joined</span>
                          <span style={{ color: ev.fee === 0 ? 'var(--green)' : 'var(--text-3)', fontWeight: 800 }}>
                            {ev.fee === 0 ? 'Free' : `₹${ev.fee}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ── QR / CHECK-IN ──────────────────────────────────── */}
          <section className={`screen ${screen === 's-qr' ? 'active' : ''}`}>
            <div className="qr-screen-top">
              <button className="back-btn" onClick={() => setScreen('s-home')}>
                <ArrowLeft size={20} color="var(--text-1)" />
              </button>
              <div className="qr-screen-title">Verify Attendance</div>
              <div style={{ width: 40 }} />
            </div>

            {qrStep === 'scan' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div className="qr-viewfinder">
                  <div className="qr-frame">
                    <div className="qr-scan-line" />
                    <div className="qr-corner tl" />
                    <div className="qr-corner tr" />
                    <div className="qr-corner bl" />
                    <div className="qr-corner br" />
                    <div className="qr-inner-pattern">
                      {qrPattern.map((on, i) => (
                        <div key={i} className="qr-cell" style={{ opacity: on ? 1 : 0 }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="qr-info">
                  <h3>Scan Event QR Code</h3>
                  <p>Attendance is verified using your device's GPS coordinates matched against the venue location. Earn XP for showing up!</p>
                </div>

                <div className="qr-btn-row" style={{ width: '100%' }}>
                  <button className="btn-primary" onClick={verifyAttendance}>
                    📍 Scan & Check-In
                  </button>
                </div>
              </div>
            ) : (
              <div className="qr-success">
                <div className="success-ring">
                  <Check size={50} color="var(--green)" strokeWidth={2.5} />
                </div>
                <div className="success-xp">+{xpAwarded} XP</div>
                <div className="success-label">Attendance Verified! 🎉</div>
                <div className="success-sub">
                  Your GPS coordinates matched the venue area.<br />XP and streak have been updated!
                </div>
                <button className="btn-primary" style={{ maxWidth: 320 }} onClick={() => setScreen('s-home')}>
                  Back to Home
                </button>
              </div>
            )}
          </section>

          {/* ── PROFILE ─────────────────────────────────────────── */}
          <section className={`screen ${screen === 's-profile' ? 'active' : ''}`}>
            <div className="profile-header-row">
              <div className="profile-header-title">My Profile</div>
            </div>

            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-top">
                <div className="profile-avatar" style={{ width: 68, height: 68, fontSize: 26 }}>
                  {user?.avatar
                    ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user?.name?.[0]?.toUpperCase() || 'S'}
                  <div className="profile-verified">
                    <Check size={9} color="white" strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <div className="profile-name">{user?.name || 'Sparker'}</div>
                  <div className="profile-handle">@{user?.name?.toLowerCase().replace(/\s/g, '') || 'sparker'} · Bangalore</div>
                </div>
              </div>
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-num" style={{ color: 'var(--orange)' }}>{xp}</div>
                  <div className="stat-lbl">Total XP</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ color: 'var(--green)' }}>{user?.verifiedEvents?.length || 0}</div>
                  <div className="stat-lbl">Events Attended</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ color: 'var(--blue)' }}>{user?.streakDays || 0}</div>
                  <div className="stat-lbl">Day Streak</div>
                </div>
              </div>
            </div>

            {/* Social Fitness Score */}
            <div className="score-card">
              <div className="score-card-title">Social Fitness Score</div>
              <div className="score-row">
                <div className="score-ring-container">
                  <svg width="110" height="110" className="score-ring-svg" viewBox="0 0 110 110">
                    <circle className="score-ring-bg"  cx="55" cy="55" r="46" strokeWidth="9" />
                    <circle className="score-ring-val" cx="55" cy="55" r="46" strokeWidth="9"
                      strokeDasharray="289"
                      strokeDashoffset={289 - (289 * 0.86)}
                    />
                  </svg>
                  <div className="score-center">
                    <div className="score-num">86</div>
                    <div className="score-label">/ 100</div>
                  </div>
                </div>
                <div className="score-stats">
                  <div>
                    <div className="score-stat-num" style={{ color: 'var(--orange)' }}>{user?.verifiedEvents?.length || 0}</div>
                    <div className="score-stat-lbl">Events</div>
                  </div>
                  <div>
                    <div className="score-stat-num" style={{ color: 'var(--green)' }}>{(user?.verifiedEvents?.length || 0) * 2}h</div>
                    <div className="score-stat-lbl">Vol. Hours</div>
                  </div>
                  <div>
                    <div className="score-stat-num" style={{ color: 'var(--blue)' }}>{level}</div>
                    <div className="score-stat-lbl">Level</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="streak-card">
              <div className="streak-header">
                <div className="streak-title">Active Streak 🔥</div>
                <div className="streak-count">{user?.streakDays || 0} Days</div>
              </div>
              <div className="streak-days">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className={`streak-day ${i < (user?.streakDays || 0) ? 'done' : ''} ${i === 4 ? 'today' : ''}`}>
                    <span className="streak-day-letter">{d}</span>
                    {i < (user?.streakDays || 0) && <span style={{ fontSize: 10, color: 'white' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Logout */}
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              Sign Out
            </button>
          </section>

          {/* ── REWARDS ─────────────────────────────────────────── */}
          <section className={`screen ${screen === 's-rewards' ? 'active' : ''}`}>
            <div className="rewards-header">
              <div className="rewards-title">Rewards Store 🎁</div>
            </div>
            <div className="rewards-balance">
              <div className="rewards-balance-label">Your Balance</div>
              <div className="rewards-balance-num">{xp}</div>
              <div style={{ fontSize: 14, color: 'var(--orange)', fontWeight: 700, marginBottom: 2 }}>XP</div>
              <div className="rewards-balance-sub">Redeem for partner benefits & workshop discounts</div>
            </div>

            <div style={{ padding: '0 20px 8px' }}>
              <div className="section-title" style={{ fontSize: 15 }}>Available Rewards</div>
            </div>
            <div className="rewards-grid">
              {rewardStoreList.map((rw, i) => {
                const canRedeem = xp >= rw.cost;
                return (
                  <div key={i} className="reward-card">
                    <div className="reward-icon" style={{ background: `${rw.color}22`, border: `1px solid ${rw.color}33` }}>
                      <span>{rw.icon}</span>
                    </div>
                    <div className="reward-title">{rw.title}</div>
                    <div className="reward-partner">{rw.partner}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div className="reward-cost">{rw.cost}</div>
                        <div className="reward-cost-sub">XP to unlock</div>
                      </div>
                      <button
                        className="redeem-btn"
                        style={{
                          background: canRedeem ? 'var(--orange)' : 'var(--card-3)',
                          color: canRedeem ? 'white' : 'var(--text-3)'
                        }}
                        onClick={() => canRedeem ? toast(`🎉 Redeemed: ${rw.title}!`) : toast(`Need ${rw.cost - xp} more XP`)}
                      >
                        {canRedeem ? 'Redeem' : 'Locked'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── LEADERBOARD ─────────────────────────────────────── */}
          <section className={`screen ${screen === 's-leaderboard' ? 'active' : ''}`}>
            <div className="lb-header">
              <div className="lb-eyebrow">Community</div>
              <div className="lb-title">Leaderboard 🏆</div>
              <div className="lb-sub">Top Sparkers this week · Bangalore</div>
            </div>

            {/* Podium */}
            <div className="podium">
              {[leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean).map((p, idx) => (
                <div key={idx} className="podium-item">
                  <div className="pod-avatar" style={{ border: `3px solid ${idx === 0 ? '#C0C0C0' : idx === 1 ? '#FFD700' : '#CD7F32'}` }}>
                    {p.name[0]}
                  </div>
                  <div className="pod-name">{p.name.split(' ')[0]}</div>
                  <div className="pod-xp">{p.xp} XP</div>
                  <div className={`pod-block ${idx === 0 ? 'pod-block-2' : idx === 1 ? 'pod-block-1' : 'pod-block-3'}`}>
                    <span style={{ fontWeight: 900, color: 'white', fontSize: 13 }}>
                      {idx === 0 ? '2nd' : idx === 1 ? '1st' : '3rd'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '0 20px 8px' }}>
              <div className="section-title" style={{ fontSize: 15 }}>Full Rankings</div>
            </div>
            <div className="lb-list">
              {leaderboard.map((p, i) => (
                <div key={i} className={`lb-item ${p.name === user?.name || p.me ? 'me' : ''}`}>
                  <div className="lb-rank">#{i + 1}</div>
                  <div className="lb-avatar">{p.name[0]}</div>
                  <div>
                    <div className="lb-name">{p.name}{(p.name === user?.name || p.me) ? ' (You)' : ''}</div>
                    <div className="lb-events">Level {p.level || 1} Sparker</div>
                  </div>
                  <div className="lb-xp">{p.xp} XP</div>
                </div>
              ))}
            </div>
          </section>

        </div>{/* /screen-container */}

        {/* ── Bottom Nav (Mobile) ──────────────────────────────── */}
        {screen !== 's-interests' && (
          <nav className="bottom-nav">
            {navItems.map(({ id, label, Icon, center }) => (
              center ? (
                <button key={id} className="nav-center-btn" onClick={() => setScreen(id)}>
                  <Icon size={24} color="white" />
                </button>
              ) : (
                <button key={id} className={`nav-btn ${screen === id ? 'active' : ''}`} onClick={() => setScreen(id)}>
                  <Icon size={22} />
                  <span>{label}</span>
                </button>
              )
            ))}
          </nav>
        )}
      </div>{/* /main-content */}

      {/* ── Event Detail Modal ────────────────────────────────── */}
      {isDetailOpen && selectedEvent && (
        <div className="modal-overlay" onClick={closeEventDetails}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-banner" style={{ background: `linear-gradient(135deg, ${selectedEvent.color}33, ${selectedEvent.color}55)` }}>
              <span style={{ fontSize: 64 }}>{selectedEvent.imageEmoji || getCatIcon(selectedEvent.category)}</span>
              <button className="modal-close" onClick={closeEventDetails}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-title">{selectedEvent.title}</div>
              <div className="modal-meta">
                <span className="modal-chip orange">+{selectedEvent.xp} XP</span>
                <span className="modal-chip">{selectedEvent.category}</span>
                <span className={`modal-chip ${selectedEvent.fee === 0 ? 'green' : ''}`}>
                  {selectedEvent.fee === 0 ? 'Free' : `₹${selectedEvent.fee}`}
                </span>
              </div>

              <div className="modal-info-row">
                <Clock size={16} className="modal-info-icon" color="var(--text-3)" />
                <span className="modal-info-bold">{selectedEvent.date}</span>
              </div>
              <div className="modal-info-row">
                <MapPin size={16} className="modal-info-icon" color="var(--text-3)" />
                <span>{selectedEvent.location}</span>
              </div>
              <div className="modal-info-row">
                <Users size={16} className="modal-info-icon" color="var(--text-3)" />
                <span><span className="modal-info-bold">{selectedEvent.attendees}</span> / {selectedEvent.maxAtt} joined</span>
              </div>

              {selectedEvent.distanceLabel && (
                <div className="modal-info-row">
                  <Navigation size={16} className="modal-info-icon" color="var(--blue)" />
                  <span style={{ color: 'var(--blue)', fontWeight: 700 }}>{selectedEvent.distanceLabel}</span>
                </div>
              )}

              <div className="modal-divider" />
              <div className="modal-desc">{selectedEvent.desc}</div>

              <div className="modal-divider" />
              <div className="modal-host">
                <div className="modal-host-avatar">{selectedEvent.hostInit}</div>
                <div>
                  <div className="modal-host-name">{selectedEvent.host}</div>
                  <div className="modal-host-role">Event Organiser</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {user?.joinedEvents?.map(String).includes(String(selectedEvent._id)) ? (
                <div className="modal-already-joined">✓ You've joined this event! Show up and scan in.</div>
              ) : (
                <button
                  className="btn-primary"
                  style={{ marginTop: 0 }}
                  onClick={() => { joinEvent(selectedEvent._id); closeEventDetails(); }}
                >
                  Join Event
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────── */}
      <div className={`toast ${showToast ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  );
}
