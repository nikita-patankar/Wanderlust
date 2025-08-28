const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");

// User model
const User = require("../models/user.js");

// User controller
const userController = require("../controller/users.js");

// ========== ROUTES ==========

// SIGNUP: Show form and handle submission
router.route("/signup")
    // GET: Render signup form
    .get(userController.renderSignupForm)
    // POST: Handle user registration
    .post(wrapAsync(userController.signup));

// LOGIN: Show form and handle authentication
router.route("/login")
    // GET: Render login form
    .get(userController.renderLoginForm)
    // POST: Authenticate using Passport
    .post(
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        userController.login
    );

// LOGOUT: End session and redirect
router.get("/logout", userController.logout);

module.exports = router;