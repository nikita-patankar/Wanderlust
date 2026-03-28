const User = require("../models/user.js");

// ========== RENDER SIGNUP FORM ==========
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// ========== SIGNUP USER ==========
module.exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });

        const registeredUser = await User.register(newUser, password);

        await new Promise((resolve, reject) => {
            req.login(registeredUser, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        // ✅ Save session before redirecting on success
        req.session.save((err) => {
            if (err) return next(err);
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch (err) {
        // ✅ FIX: save session before redirecting on error too
        req.flash("error", err.message);
        req.session.save((saveErr) => {
            if (saveErr) return next(saveErr);
            res.redirect("/signup");
        });
    }
};

// ========== RENDER LOGIN FORM ==========
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

// ========== LOGIN USER ==========
module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = req.session.redirectUrl || "/listings";
    delete req.session.redirectUrl;
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