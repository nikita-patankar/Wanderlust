// Import express and create a router
const express = require("express");
const router = express.Router({ mergeParams: true }); 
// mergeParams allows access to :id from parent route (e.g., /listings/:id/reviews)

// Utility to catch async errors and pass them to error handlers
const wrapAsync = require("../utils/wrapAsync.js");

// Middleware functions
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware.js");

// Mongoose models
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

// Review controller that handles actual logic
const reviewController = require("../controller/review.js");

// =======================
//         ROUTES
// =======================

// POST /listings/:id/reviews
// Adds a review to the listing with the given ID
router.post(
    "/", 
    isLoggedIn,               // Only logged-in users
    validateReview,           // Joi schema validation for review content
    wrapAsync(reviewController.addReview) // Controller handles DB operations
);

// DELETE /listings/:id/reviews/:reviewId
// Deletes a specific review by ID
router.delete(
    "/:reviewId",
    isLoggedIn,               // Only logged-in users
    isReviewAuthor,           // Only the author of the review can delete it
    wrapAsync(reviewController.destroyReview)
);

// Export the router to be used in app.js
module.exports = router;
