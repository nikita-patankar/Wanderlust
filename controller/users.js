const User = require("../models/user.js");

// ========== RENDER SIGNUP FORM ==========
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

// ========== SIGNUP USER ==========

module.exports.signup = async (req, res, next) => {
    try {
        const username = req.body.username?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!username || !email || !password) {
            req.flash("error", "All fields are required.");
            return res.redirect("/signup");
        }

        const newUser = new User({
            username,
            email
        });

        const registeredUser = await User.register(
            newUser,
            password
        );

        await new Promise((resolve, reject) => {
            req.login(registeredUser, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        req.session.save((err) => {
            if (err) return next(err);

            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (err) {
        if (err.code === 11000) {
            req.flash(
                "error",
                "This email is already registered. Please log in."
            );
            return res.redirect("/signup");
        }

        if (err.name === "UserExistsError") {
            req.flash(
                "error",
                "This email is already registered. Please log in."
            );
            return res.redirect("/signup");
        }

        next(err);
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