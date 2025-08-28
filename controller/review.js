const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

// ========== CREATE REVIEW ==========
module.exports.addReview = async (req, res) => {
    // Find the listing for which the review is being added
    const listing = await Listing.findById(req.params.id);

    // Extract rating and comment from form (supports both JS and non-JS forms)
    const rating = req.body.review?.rating || req.body["review[rating]"];
    const comment = req.body.review?.comment || req.body["review[comment]"];

    // Create new review with current user as author
    const newReview = new Review({ rating, comment, author: req.user._id });

    // Push review into the listing's reviews array
    listing.reviews.push(newReview);

    // Save review and listing
    await newReview.save();
    await listing.save();

    req.flash("success", "Successfully created a review.");
    res.redirect(`/listings/${listing._id}`);
};

// ========== DELETE REVIEW ==========
module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove reference to review from the listing
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    // Delete the actual review document
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Successfully deleted review.");
    res.redirect(`/listings/${id}`);
};
