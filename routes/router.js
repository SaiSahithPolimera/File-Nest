const express = require("express");
const router = express.Router();
const appController = require("../controllers/appController");

router.get("/", appController.getHome);
router.get("/sign-up", appController.getSignUp);

module.exports = router;