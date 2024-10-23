const { validationResult } = require("express-validator");
const { genPassword } = require("../lib/passportUtils");
const passport = require("passport");
const db = require("../db/queries");
const fs = require("fs-extra");
const path = require("path");

const loadFolderData = async (folderName) => {
  try {
    const files = await fs.readdir(`uploads/${folderName}`);
    return files;
  } catch (err) {
    console.error(err);
    console.log("Error while loading files from folders");

    return [];
  }
};

const getFileDetails = async (folderName) => {
  const fileInfos = [];
  try {
    const files = await loadFolderData(folderName);
    for (const file of files) {
      const filePath = `uploads/${folderName}/${file}`;
      const stats = await fs.stat(filePath);
      const fileOrFolder = stats.isFile() ? "File" : "Folder";
      const fileType = path.extname(filePath);
      const fileSize = stats.size;
      const dateCreated = stats.atime;
      const date = `${dateCreated.getDate()}/${
        dateCreated.getMonth() + 1
      }/${dateCreated.getFullYear()}`;

      const fileName = file;
      fileInfos.push({ fileName, fileType, dateCreated: date, fileSize, fileOrFolder });
    }
  } catch (err) {
    console.error(err);
    console.log("Error while retrieving file details");
  }
  return fileInfos;
};

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
  const user_id = req.session.passport.user;
  try {
    const filesData = await getFileDetails(user_id);
    return res.render("dashboard", { filesData: filesData });
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

exports.fileUploadPost = (req, res) => {
  return res.redirect("/dashboard");
};


exports.deleteFileGet = (req, res) => {
  console.log(req.body);
  return res.redirect("/dashboard");
  
}