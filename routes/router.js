const express = require("express");
const router = express.Router();
const appController = require("../controllers/appController");
const signUpValidator = require("../validators/signUpValidator");
const loginValidator = require("../validators/loginValidator");

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

module.exports = router;
