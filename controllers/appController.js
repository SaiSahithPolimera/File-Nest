const { validationResult } = require("express-validator");
const { genPassword } = require("../lib/passportUtils");
const passport = require("passport");
const db = require("../db/queries");
const supabase = require("../config/supabase");

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
        return res.render("login", {
          message: "Incorrect username or password",
        });
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

exports.dashboardGet = async (req, res) => {
  const userID = req.session.passport.user;
  try {
    const folderID = await db.getFolderIDByName(userID.toString());
    if (!folderID) {
      const { data, error } = await supabase.storage
        .from("File-Nest")
        .upload(`${userID}/.emptyFolderPlaceholder`);
      if (error) {
        console.log("Error creating new folder");
        console.error(error);
        return res.render("dashboard");
      }

      await db.createNewFolder(userID.toString(), userID, data.path, null);
    }
    const filesData = await db.getFilesFromFolder(folderID);
    const subFolders = await db.getSubFolders(userID, userID);
    return res.render("dashboard", {
      filesData: filesData,
      subFolders: subFolders,
    });
  } catch (err) {
    console.error(err);
    console.log("Error while loading file data");
  }
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