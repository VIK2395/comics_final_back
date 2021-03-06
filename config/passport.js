const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const UserOauth = require('../src/models/UserOauth');

passport.use(
  // dependensy injection
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACK_END_DOMAIN}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await UserOauth.findOne({ googleId: profile.id });

      if (user) {
        done(null, user);
      } else {
        user = new UserOauth({
          googleId: profile.id,
          email: profile._json.email,
          displayName: profile.displayName,
        });

        await user.save();
        done(null, user);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  UserOauth.findById(id, (err, user) => done(err, user));
});
