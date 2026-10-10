
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const {
  listingSchema,
  reviewSchema,
} = require("./schema.js");

const ExpressError = require("./utils/expressError.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ===========================
// Authentication Middleware
// ===========================

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;

    req.flash(
      "error",
      "You must be logged in to access this page."
    );

    return res.redirect("/login");
  }

  next();
};

// ===========================
// Listing Ownership Middleware
// ===========================

const isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing not found.");
      return res.redirect("/listings");
    }

    if (!listing.owner.equals(req.user._id)) {
      req.flash(
        "error",
        "You are not the owner of this listing!"
      );

      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ===========================
// Review Author Middleware
// ===========================

const isReviewAuthor = async (req, res, next) => {
  try {
    const { reviewId, id } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      req.flash("error", "Review not found.");
      return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(req.user._id)) {
      req.flash(
        "error",
        "You do not have permission to delete this review."
      );

      return res.redirect(`/listings/${id}`);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// ===========================
// Listing Validation
// ===========================

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const message = error.details
      .map((detail) => detail.message)
      .join(", ");

    return next(new ExpressError(message, 400));
  }

  next();
};

// ===========================
// Review Validation
// ===========================

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body, {
    abortEarly: false,
    convert: true,
  });

  if (error) {
    const message = error.details
      .map((detail) => detail.message)
      .join(", ");

    return next(new ExpressError(message, 400));
  }

  next();
};

// ===========================
// Multer Configuration
// ===========================

// Ensure the upload directory exists.
const uploadDir = path.join(
  __dirname,
  "public",
  "uploads"
);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// ===========================
// Export Middleware
// ===========================

module.exports = {
  isLoggedIn,
  isOwner,
  isReviewAuthor,
  validateListing,
  validateReview,
  upload,
};
