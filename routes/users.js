const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const userController = require("../controller/users.js");

// SIGNUP
router.route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup)); // now async/await compatible

// LOGIN
router.route("/login")
  .get(userController.renderLoginForm)
  .post(
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    userController.login
  );

// LOGOUT
router.get("/logout", userController.logout);

module.exports = router;