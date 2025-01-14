const express = require("express");
const router = express.Router();
const appController = require("../controllers/appController");
const signUpValidator = require("../validators/signUpValidator");
const loginValidator = require("../validators/loginValidator");
const driverController = require("../controllers/driverController");

router.get("/", appController.getHome);
router.get("/sign-up", appController.userSignUpGet);
router.post("/sign-up", signUpValidator, appController.userSignUpPost);
router.get("/login", appController.userLoginGet);
router.post("/login", loginValidator, appController.userLoginPost);
router.get(
  "/dashboard",
  appController.isAuthenticated,
  appController.dashboardGet
);
router.post("/dashboard", driverController.fileUploadPost)
router.post("/dashboard/delete", driverController.deleteFilePost);
router.get("/dashboard/download", driverController.downloadFileGet);
router.get("/dashboard/new", driverController.newFolderCreateGet);
router.get("/dashboard/new/:parentFolderID", driverController.newFolderCreateGet);
router.post("/dashboard/share", driverController.shareFileHandler)
router.get("/dashboard/:folderName", driverController.newFolderGet);
router.post("/dashboard/:folderName", driverController.newFolderPost);
router.get("/dashboard/delete/:folderName", driverController.deleteFolderGet);
module.exports = router;
