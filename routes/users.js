var express = require("express");
var router = express.Router();
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const csrf = require("csurf");
router.use(csrf());

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/signup", notSignin, (req, res, next) => {
  var massageError = req.flash("signupError");
  res.render("user/signup.hbs", {
    massages: massageError,
    token: req.csrfToken(),
  });
});

router.post(
  "/signup",
  [
    check("email").not().isEmpty().withMessage("Please enter ur Email"),
    check("email").isEmail().withMessage("Please enter valid email"),
    check("password").not().isEmpty().withMessage("Please enter ur password"),
    check("password")
      .isLength({ min: 5, max: 10 })
      .withMessage("length between 5:10"),
    check("confirm-password").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("confirm-password not match with password");
      }
      return true;
    }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    var validationMsg = [];
    if (!errors.isEmpty()) {
      for (var i = 0; i < errors.errors.length; i++) {
        validationMsg.push(errors.errors[i].msg);
      }
      req.flash("signupError", validationMsg);
      res.redirect("signup");
      return;
    }
    next();
  },
  passport.authenticate("local-signup", {
    session: false,
    successRedirect: "/",
    failureRedirect: "signup",
    failureMessage: true,
  })
);

router.get("/profile", isSignin, (req, res, next) => {
  User.findOne({ email: req.user.email })
    .then((doc) => {
      if (doc.cart) {
        res.render("user/profile", {
          checkUser: true,
          checkProfile: false,
          totalProducts: req.user.cart.totalQuantity,
          user: doc,
        });
      } else {
        res.render("user/profile", {
          checkUser: true,
          checkProfile: false,
          totalProducts: 0,
          user: doc,
        });
      }
    })
    .catch((err) => {});
});

router.get("/signin", notSignin, (req, res, next) => {
  var massageError = req.flash("signinError");
  console.log(req.csrfToken());
  res.render("user/signin.hbs", {
    massages: massageError,
    token: req.csrfToken,
  });
});

router.post(
  "/signin",
  [
    check("email").not().isEmpty().withMessage("Please enter ur Email"),
    check("email").isEmail().withMessage("Please enter valid email"),
    check("password").not().isEmpty().withMessage("Please enter ur password"),
    check("password")
      .isLength({ min: 5, max: 10 })
      .withMessage("length between 5:10"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    var validationMsg = [];
    if (!errors.isEmpty()) {
      for (var i = 0; i < errors.errors.length; i++) {
        validationMsg.push(errors.errors[i].msg);
      }
      req.flash("signinError", validationMsg);
      res.redirect("signin");
      return;
    }
    next();
  },
  passport.authenticate("local-signin", {
    successRedirect: "/",
    failureRedirect: "signin",
    failureFlash: true,
  })
);

router.get("/logout", isSignin, (req, res, next) => {
  req.logOut((err) => {
    res.send(err);
  });
  res.redirect("signin");
});
router.get("/userData", isSignin, (req, res, next) => {
  User.findOne({ email: req.user.email })
    .then((doc) => {
      res.render("user/userData", {
        checkUser: true,
        checkProfile: false,
        token: req.csrfToken,
        user: doc,
      });
    })
    .catch((err) => {});
});

router.post("/userData", async (req, res, next) => {
  var user;
  await User.findOne({ email: req.user.email }).then((d) => {
    user = d;
  });
  User.findOne({ email: req.user.email })
    .then((doc) => {
      if (req.body.userName.length > 0) {
        doc.name = req.body.userName;
      } else {
        doc.name = user.name;
      }
      if (req.body.address.length > 0) {
        doc.address = req.body.address;
      } else {
        doc.address = user.address;
      }
      if (req.body.phone.length > 0) {
        doc.phone = req.body.phone;
      } else {
        doc.phone = user.phone;
      }
      if (req.body.postalCode.length > 0) {
        doc.postalCode = req.body.postalCode;
      } else {
        doc.postalCode = user.postalCode;
      }
      if (req.body.profileImg.length > 0) {
        doc.profileImg = req.body.profileImg;
      } else {
        doc.profileImg = user.profileImg;
      }
      console.log(doc);
      User.updateOne({ email: req.user.email }, { $set: doc })
        .then((doc2) => {})
        .catch((err) => {});
    })
    .catch((err) => {});
  res.redirect("profile");
});

function isSignin(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect("signin");
    return;
  }
  next();
}

function notSignin(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/");
    return;
  }
  next();
}

module.exports = router;
