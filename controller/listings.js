const Listing = require('../models/listing');
const NodeGeocoder = require('node-geocoder');
const fetch = require('node-fetch');

// 🌍 Configure OpenStreetMap geocoder with custom user-agent
const options = {
    provider: 'openstreetmap',
    httpAdapter: 'https',
    formatter: null,
    fetch: function (url, opts) {
        opts.headers = {
            'User-Agent': 'wanderlust-clone-by-nikki (nikki@example.com)' // Your email for API identification
        };
        return fetch(url, opts);
    }
};

const geocoder = NodeGeocoder(options);

// 🏠 Index - Show all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
};

// 📄 New Form - Render new listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// ➕ Create - Save new listing
module.exports.createListing = async (req, res) => {
    console.log("🌄 Uploaded file info:", req.file);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await newListing.save();
    req.flash("success", "Successfully created a listing.");
    res.redirect(`/listings/${newListing._id}`);
};

// 🔍 Show - Display a specific listing
module.exports.showeachListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: { path: "author" }
        });

    if (!listing) {
        req.flash("error", "Listing does not exist.");
        return res.redirect("/listings");
    }

    // 🌍 Try to get coordinates
    let coordinates = null;

    try {
        const geoData = await geocoder.geocode(listing.location);
        console.log("🌍 Geocoded data:", geoData);

        if (geoData.length > 0) {
            coordinates = [geoData[0].latitude, geoData[0].longitude];
        } else {
            console.warn("⚠️ No coordinates found for:", listing.location);
        }
    } catch (err) {
        console.error("❌ Geocoding error:", err.message);
    }

    // Fallback coordinates if geocoder fails
    if (!coordinates) {
        coordinates = [28.6139, 77.2090]; // Delhi fallback
    }

    console.log("📍 Coordinates sent to map:", coordinates);
    res.render("listings/show.ejs", { listing, coordinates });
};

// ✏️ Edit Form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist.");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
};

// ♻️ Update Listing
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    await listing.save();

    req.flash("success", "Listing updated successfully.");
    res.redirect(`/listings/${listing._id}`);
};

// ❌ Delete Listing
module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        req.flash("error", "Listing does not exist.");
        return res.redirect("/listings");
    }

    req.flash("success", "Successfully deleted listing.");
    res.redirect("/listings");
};
