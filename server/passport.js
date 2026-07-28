const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const avatar = profile.photos?.[0]?.value || null;
        const googleId = profile.id;

        // Try to find user by googleId first, then by email
        let user = await User.findOne({ googleId });

        if (!user) {
          user = await User.findOne({ email });
        }

        if (!user) {
          // Brand new user — create account from Google profile
          user = new User({
            name:     profile.displayName,
            email,
            googleId,
            avatar,
            password: null,
            xp:       100,
            level:    1,
            interests:[]
          });
          user._isNew = true;  // transient flag, not persisted
        } else {
          // Existing user — sync their Google ID and avatar
          user.googleId = googleId;
          if (avatar) user.avatar = avatar;
        }

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
