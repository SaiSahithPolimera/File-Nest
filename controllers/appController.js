const { validationResult } = require("express-validator");
const { genPassword } = require("../lib/passportUtils");
const passport = require("passport");
const db = require("../db/queries");

exports.getHome = (req, res) => {
  res.render("home");
};

exports.userSignUpGet = (req, res) => {
  res.render("sign-up");
};

exports.userLoginGet = (req, res) => {
  res.render("login");
};

exports.userLoginPost = (req, res, next) => {
  const { errors } = validationResult(req);
  if (errors.length != 0) {
    return res.render("login", { errors: errors });
  } else {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.render("login", { message: "Incorrect username or password" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect("/dashboard");
      });
    })(req, res, next);
  }
};

exports.isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) return next();
};

exports.dashboardGet = (req, res) => {
  res.render("dashboard");
};

exports.userSignUpPost = async (req, res) => {
  const { errors } = validationResult(req);
  if (errors.length != 0) {
    return res.render("sign-up", { errors: errors });
  }
  const { username, password, email } = req.body;
  const { salt, genHash: hash } = genPassword(password);
  try {
    await db.createUser(username, email, hash, salt);
    res.render("login");
  } catch (err) {
    console.error(err);
    return res.render("sign-up", {
      errors: ["Error occurred while creating user!"],
    });
  }
};
