const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    callbackURL: 'http://localhost:5000/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      // Check for user with same email
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
         user.googleId = profile.id;
         user.profilePicture = profile.photos[0]?.value;
         await user.save();
         return done(null, user);
      }

      // Create new user
      const newUser = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        profilePicture: profile.photos[0]?.value,
        role: 'player' // Default role
      });

      await newUser.save();
      done(null, newUser);
    } catch (err) {
      console.error(err);
      done(err, null);
    }
  }
));

module.exports = passport;
