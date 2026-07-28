const Event = require('./models/Event');
const User  = require('./models/User');
const bcrypt = require('bcryptjs');

const demoEvents = [
  // ── ARTS ──────────────────────────────────────────────
  {
    title:        "Photography Walk",
    category:     "Arts",
    date:         "Saturday · 5:00 PM",
    location:     "Cubbon Park, Bangalore",
    neighborhood: "Cubbon Park",
    city:         "Bangalore",
    lat:          12.9734,
    lng:          77.5912,
    host:         "Riya Sharma",
    hostInit:     "R",
    maxAtt:       20,
    xp:           50,
    fee:          0,
    desc:         "Join our guided photography walk through Cubbon Park. Capture urban nature, golden hour light, and diverse architecture while meeting fellow photographers of all skill levels.",
    color:        "#E63946",
    imageEmoji:   "📷",
    tags:         ["Photography", "Outdoor", "Arts", "Nature"]
  },
  {
    title:        "Watercolour Meetup",
    category:     "Arts",
    date:         "Sunday · 4:00 PM",
    location:     "Jacaranda Studio, Indiranagar",
    neighborhood: "Indiranagar",
    city:         "Bangalore",
    lat:          12.9784,
    lng:          77.6408,
    host:         "Meera Pillai",
    hostInit:     "M",
    maxAtt:       15,
    xp:           60,
    fee:          299,
    desc:         "Explore watercolour painting in a relaxed studio setting. Materials provided. All skill levels welcome — bring your creativity!",
    color:        "#EC4899",
    imageEmoji:   "🎨",
    tags:         ["Painting", "Watercolour", "Studio", "Arts"]
  },
  // ── GAMES ─────────────────────────────────────────────
  {
    title:        "Chess Evening",
    category:     "Games",
    date:         "Wednesday · 7:00 PM",
    location:     "The Book Café, Indiranagar",
    neighborhood: "Indiranagar",
    city:         "Bangalore",
    lat:          12.9782,
    lng:          77.6403,
    host:         "Aryan Kapoor",
    hostInit:     "A",
    maxAtt:       16,
    xp:           50,
    fee:          0,
    desc:         "Weekly chess evening for all skill levels. Play friendly matches, discuss openings, and enjoy great conversations with fellow enthusiasts.",
    color:        "#3B82F6",
    imageEmoji:   "♟️",
    tags:         ["Chess", "Indoor", "Strategy", "Games"]
  },
  {
    title:        "Board Game Blitz",
    category:     "Games",
    date:         "Friday · 6:30 PM",
    location:     "Dice & Brew, Koramangala",
    neighborhood: "Koramangala",
    city:         "Bangalore",
    lat:          12.9341,
    lng:          77.6268,
    host:         "Sahil Desai",
    hostInit:     "S",
    maxAtt:       24,
    xp:           50,
    fee:          150,
    desc:         "Catan, Ticket to Ride, Codenames and more! Join Bangalore's biggest board game night. Includes refreshments.",
    color:        "#8B5CF6",
    imageEmoji:   "🎲",
    tags:         ["BoardGames", "Social", "Games", "Indoor"]
  },
  // ── FOOD ──────────────────────────────────────────────
  {
    title:        "Cooking Workshop: South Indian",
    category:     "Food",
    date:         "Saturday · 3:00 PM",
    location:     "Studio Kitchen, Koramangala",
    neighborhood: "Koramangala",
    city:         "Bangalore",
    lat:          12.9352,
    lng:          77.6245,
    host:         "Priya Mehta",
    hostInit:     "P",
    maxAtt:       12,
    xp:           50,
    fee:          499,
    desc:         "Learn to cook authentic South Indian dishes from scratch with Chef Priya. Includes hands-on cooking, tasting session, and a recipe booklet.",
    color:        "#F59E0B",
    imageEmoji:   "🍳",
    tags:         ["Cooking", "Workshop", "Food", "SouthIndian"]
  },
  {
    title:        "Street Food Safari",
    category:     "Food",
    date:         "Sunday · 11:00 AM",
    location:     "VV Puram Food Street, Basavanagudi",
    neighborhood: "Basavanagudi",
    city:         "Bangalore",
    lat:          12.9497,
    lng:          77.5720,
    host:         "Foodie Trails BLR",
    hostInit:     "F",
    maxAtt:       20,
    xp:           40,
    fee:          0,
    desc:         "Explore VV Puram's legendary food street with a local guide. Taste Masala Puri, Thatte Idli, and more iconic Bangalore street food.",
    color:        "#EF4444",
    imageEmoji:   "🍜",
    tags:         ["StreetFood", "Tour", "Food", "Outdoor"]
  },
  // ── VOLUNTEER ─────────────────────────────────────────
  {
    title:        "HSR Lake Cleanup",
    category:     "Volunteer",
    date:         "Sunday · 7:00 AM",
    location:     "HSR Lake, HSR Layout",
    neighborhood: "HSR Layout",
    city:         "Bangalore",
    lat:          12.9119,
    lng:          77.6384,
    host:         "Clean Bangalore Initiative",
    hostInit:     "C",
    maxAtt:       50,
    xp:           150,
    fee:          0,
    desc:         "Join Sparkers cleaning up HSR Lake trail. Plant a tree, restore the shoreline, earn 150 XP, and make real friends who care about the city.",
    color:        "#22C55E",
    imageEmoji:   "🌿",
    tags:         ["Volunteer", "Environment", "Outdoors", "Lake"]
  },
  {
    title:        "Teach & Learn: Code for Kids",
    category:     "Volunteer",
    date:         "Saturday · 10:00 AM",
    location:     "Government School, Jayanagar",
    neighborhood: "Jayanagar",
    city:         "Bangalore",
    lat:          12.9250,
    lng:          77.5836,
    host:         "Code For Good",
    hostInit:     "C",
    maxAtt:       15,
    xp:           120,
    fee:          0,
    desc:         "Volunteer to teach coding basics to government school students aged 10–14. No experience required — just enthusiasm and patience.",
    color:        "#14B8A6",
    imageEmoji:   "💻",
    tags:         ["Volunteer", "Education", "Coding", "Kids"]
  },
  // ── SPORTS ────────────────────────────────────────────
  {
    title:        "Sunday Football",
    category:     "Sports",
    date:         "Sunday · 6:30 AM",
    location:     "Yelahanka Sports Ground, Yelahanka",
    neighborhood: "Yelahanka",
    city:         "Bangalore",
    lat:          13.1005,
    lng:          77.5963,
    host:         "Bangalore Kickabouts",
    hostInit:     "B",
    maxAtt:       22,
    xp:           80,
    fee:          100,
    desc:         "Casual 7-a-side football every Sunday morning. All skill levels — just bring boots and energy. Balanced teams ensured.",
    color:        "#10B981",
    imageEmoji:   "⚽",
    tags:         ["Football", "Sports", "Outdoor", "Morning"]
  },
  {
    title:        "Yoga at the Park",
    category:     "Sports",
    date:         "Tuesday · 6:30 AM",
    location:     "Lalbagh Botanical Garden, Lalbagh",
    neighborhood: "Lalbagh",
    city:         "Bangalore",
    lat:          12.9507,
    lng:          77.5848,
    host:         "Ananya Rao",
    hostInit:     "A",
    maxAtt:       30,
    xp:           50,
    fee:          0,
    desc:         "Start your Tuesday right with a free yoga session in the beautiful Lalbagh gardens. Suitable for beginners and intermediate practitioners.",
    color:        "#6366F1",
    imageEmoji:   "🧘",
    tags:         ["Yoga", "Wellness", "Outdoor", "Sports", "Morning"]
  },
  // ── MUSIC ─────────────────────────────────────────────
  {
    title:        "Open Mic Night",
    category:     "Music",
    date:         "Friday · 8:00 PM",
    location:     "The Humming Tree, Indiranagar",
    neighborhood: "Indiranagar",
    city:         "Bangalore",
    lat:          12.9793,
    lng:          77.6378,
    host:         "Humming Tree Events",
    hostInit:     "H",
    maxAtt:       60,
    xp:           70,
    fee:          200,
    desc:         "Bangalore's most beloved open mic! Perform poetry, stand-up, music, or spoken word. Or just come to watch and vibe. Sign up for a 7-minute slot.",
    color:        "#F97316",
    imageEmoji:   "🎵",
    tags:         ["Music", "OpenMic", "Performance", "Nightlife"]
  },
  // ── READING / TECH ────────────────────────────────────
  {
    title:        "Book Club: Sci-Fi Picks",
    category:     "Reading",
    date:         "Thursday · 7:00 PM",
    location:     "Atta Galatta, Koramangala",
    neighborhood: "Koramangala",
    city:         "Bangalore",
    lat:          12.9346,
    lng:          77.6259,
    host:         "Atta Galatta",
    hostInit:     "A",
    maxAtt:       20,
    xp:           40,
    fee:          0,
    desc:         "Monthly sci-fi book club at Bangalore's favourite bookstore. This month: 'Piranesi' by Susanna Clarke. Come ready to discuss!",
    color:        "#0EA5E9",
    imageEmoji:   "📚",
    tags:         ["Reading", "Books", "SciFi", "Social"]
  }
];

const demoUsers = [
  { name: "Neha Joshi",  email: "neha@socialspark.in",  password: "password123", xp: 2840, level: 6 },
  { name: "Karan Bhat",  email: "karan@socialspark.in", password: "password123", xp: 2610, level: 6 },
  { name: "Dev Singh",   email: "dev@socialspark.in",   password: "password123", xp: 2190, level: 5 },
  { name: "Priya Nair",  email: "priya@socialspark.in", password: "password123", xp: 1980, level: 4 },
  { name: "Rahul Verma", email: "rahul@socialspark.in", password: "password123", xp: 1740, level: 4 },
  { name: "Mahib Khan",  email: "mahib@socialspark.in", password: "password123", xp: 1240, level: 3 }
];

async function seedDatabase() {
  try {
    // Seed Events (drop old events when count changes)
    const eventCount = await Event.countDocuments({});
    if (eventCount < demoEvents.length) {
      await Event.deleteMany({});
      await Event.insertMany(demoEvents);
      console.log(`✅ Seeded ${demoEvents.length} demo events into MongoDB.`);
    }

    // Seed Demo Users for Leaderboard
    for (let u of demoUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const hashed = await bcrypt.hash(u.password, 10);
        await User.create({ ...u, password: hashed });
      }
    }
    console.log(`✅ Demo users verified/seeded for leaderboard.`);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  }
}

module.exports = seedDatabase;
