const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../db/queries");
const { validPassword } = require("../lib/passportUtils");

const verifyCallback = async (username, password, done) => {
  db.verifyUserByName(username)
    .then((user) => {
      if (!user) {
        return done(null, false, { message: "Incorrect username!" });
      }
      const isValid = validPassword(password, user.hash, user.salt);
      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect password!" });
      }
    })
    .catch((err) => done(err));
};

const strategy = new LocalStrategy(verifyCallback);
passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser((user_id, done) => {
  db.verifyUserByID(user_id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => done(err));
});

module.exports = passport;
