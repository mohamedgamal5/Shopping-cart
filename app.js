var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const expressSession = require("express-session");
const falsh = require("connect-flash");
const passport = require("passport");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

mongoose
  .connect("mongodb://localhost/Shopping-cart")
  .then(() => console.log(`success connect to DB`))
  .catch((err) => console.log(err));

require("./config/passport");

// view engine setup
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "layout",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
      multiply: function (val1, val2) {
        return val1 * val2;
      },
      addOne: function (val1) {
        return val1 + 1;
      },
    },
  })
);

//app.set("views", path.join(__dirname, "views"));
app.set("view engine", ".hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  expressSession({
    secret: "Shopping-cart_?@!",
    saveUninitialized: false,
    resave: true,
  })
);
app.use(falsh());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log;
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
