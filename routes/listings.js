const express = require("express");
const router = express.Router();
const { upload } = require("../cloudConfig.js"); 
const wrapAsync = require("../utils/wrapAsync.js");

const {
    isLoggedIn,
    isOwner,
    validateListing
} = require("../middleware.js");

const listingController = require("../controller/listings.js");

// GET all listings
router.get("/", wrapAsync(listingController.index));

// Form to create new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Create listing
router.post(
    "/",
    isLoggedIn,
    upload.single("image"),   // ✅ matches name="image" in form
    validateListing,
    wrapAsync(listingController.createListing)
);

// Edit form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Show, Update, Delete
router.route("/:id")
    .get(wrapAsync(listingController.showeachListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("image"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroyListing)
    );

module.exports = router;
