// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const ExpressError = require("./utils/expressError.js");

const User = require("./models/user.js");
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");

const app = express();

const DB_URL = process.env.ATLASDB_URL;

async function connectDB() {
    try {
        await mongoose.connect(DB_URL);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB Error:", err);
        process.exit(1);
    }
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const store = MongoStore.create({
    mongoUrl: DB_URL,
    crypto: { secret: process.env.SECRET },
    touchAfter: 24 * 60 * 60
});

store.on("error", (err) => console.error("❌ MongoDB Store Error:", err));

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        maxAge: 1000 * 60 * 60 * 24 * 3
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Set Flash & User Locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// ✅ FIX: exclude /signup and /login from being saved as redirectUrl
// Replace your existing redirectUrl middleware with this:
app.use((req, res, next) => {
    const excludedPaths = ["/login", "/signup"];
    if (
        !req.user &&
        !excludedPaths.includes(req.originalUrl) &&
        req.method === "GET"
    ) {
        req.session.redirectUrl = req.originalUrl;
    }
    res.locals.redirectUrl = req.session.redirectUrl || "/listings"; // ✅ added back
    next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    console.error("❌ Error:", err);
    res.status(statusCode).render("error", { err });
});

connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
});