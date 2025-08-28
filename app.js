// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Imports
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

// Models and Routes
const User = require("./models/user.js");
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");

const app = express();

// MongoDB Connection
const DB_URL = process.env.ATLASDB_URL;
mongoose.connect(DB_URL)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// View Engine and Middleware
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session Configuration
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
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 days
        maxAge: 1000 * 60 * 60 * 24 * 3
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
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

// Save original URL for redirect after login
app.use((req, res, next) => {
    if (!req.user && req.originalUrl !== "/login" && req.method === "GET") {
        req.session.redirectUrl = req.originalUrl;
    }
    res.locals.redirectUrl = req.session.redirectUrl || "/listings";
    next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Home Page Route
app.get("/", (req, res) => {
    res.render("home"); // Make sure you create views/home.ejs
});

// 404 Handler
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    console.error("❌ Error:", err);
    res.status(statusCode).render("error", { err });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
// Load environment variables in development
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Imports
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

// Models and Routes
const User = require("./models/user.js");
const listingRouter = require("./routes/listings.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/users.js");

const app = express();

// MongoDB Connection
const DB_URL = process.env.ATLASDB_URL;
mongoose.connect(DB_URL)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// View Engine and Middleware
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session Configuration
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
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 days
        maxAge: 1000 * 60 * 60 * 24 * 3
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
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

// Save original URL for redirect after login
app.use((req, res, next) => {
    if (!req.user && req.originalUrl !== "/login" && req.method === "GET") {
        req.session.redirectUrl = req.originalUrl;
    }
    res.locals.redirectUrl = req.session.redirectUrl || "/listings";
    next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// Home Page Route
app.get("/", (req, res) => {
    res.render("home"); // Make sure you create views/home.ejs
});

// 404 Handler
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    console.error("❌ Error:", err);
    res.status(statusCode).render("error", { err });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
