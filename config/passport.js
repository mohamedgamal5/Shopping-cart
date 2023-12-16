const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const Cart = require("../models/Cart");

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, "email")
    .then((user) => {
      Cart.findById(id)
        .then((cart) => {
          if (!cart) {
            return done(null, user);
          }
          user.cart = cart;
          return done(null, user);
        })
        .catch((err) => {
          return done(err, null);
        });
    })
    .catch((err) => {
      return done(err, null);
    });
});

passport.use(
  "local-signin",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      await User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(
              null,
              false,
              req.flash("signinError", "This user not found")
            );
          }
          if (!user.comparePassword(password)) {
            return done(
              null,
              false,
              req.flash("signinError", "WSrong password")
            );
          }
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);

passport.use(
  "local-signup",
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      await User.findOne({ email: email })
        .then(async (user) => {
          console.log(`use=>${user}`);
          if (user) {
            return done(
              null,
              false,
              req.flash("signupError", "This E-mail already exist")
            );
          }
          const newUser = new User({
            email: email,
            password: new User().hashPassword(password),
          });
          await newUser
            .save()
            .then((doc) => {
              console.log(`doc>${doc}`);
              return done(null, newUser);
            })
            .catch((err) => {
              console.error(err);
              return done(err);
            });
        })
        .catch((err) => {
          return done(err);
        });
    }
  )
);
