const { validationResult } = require("express-validator");
const { genPassword } = require("../lib/passportUtils");
const passport = require("passport");
const db = require("../db/queries");
const fs = require("fs-extra");

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

exports.deleteFilePost = async (req, res) => {
  const { path } = req.body;
  const routes = path.split("/");
  const fileName = routes[routes.length - 1];
  fs.remove(path, async (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("File deleted successfully!");
      const fileID = await db.getFileIDByName(fileName);
      await db.deleteFile(fileID);
    }
  });
  res.redirect("/dashboard");
};

exports.downloadFileGet = (req, res) => {
  const { path } = req.query;
  res.download(path);
};

exports.newFolderCreateGet = async (req, res) => {
  const { folderName } = req.query;
  const { parentFolderID } = req.params;
  const userID = req.session.passport.user;
  let dirPath = `./uploads/${userID}/${folderName}`;
  if (parentFolderID) {
    const { path } = await db.getFolderDetails(Number(parentFolderID), userID);
    dirPath = `${path}/${folderName}`;
    await db.createNewFolder(
      folderName,
      userID,
      dirPath,
      Number(parentFolderID)
    );
  } else {
    await db.createNewFolder(folderName, userID, dirPath, userID);
  }
  fs.ensureDir(dirPath)
    .then((res) => {
      console.log("Folder created successfully!");
    })
    .catch((err) => {
      console.error(err);
      console.log(`Error occurred while creating folder ${folderName}`);
    });
  return res.redirect(`/dashboard`);
};
