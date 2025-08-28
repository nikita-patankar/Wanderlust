const User = require("../models/user.js");

// ========== RENDER SIGNUP FORM ==========
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// ========== SIGNUP USER ==========
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Create a new user object (without password)
        const newUser = new User({ email, username });

        // Register user (hashes password and saves)
        const registeredUser = await User.register(newUser, password);

        // Log the user in automatically after signup
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// ========== RENDER LOGIN FORM ==========
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login"); // ✅ you don’t need to pass redirectUrl manually
};


// ========== LOGIN USER ==========
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.body.returnTo || "/listings";
    res.redirect(redirectUrl);
};


// ========== LOGOUT USER ==========
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};
