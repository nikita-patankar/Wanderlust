
const Listing = require("../models/listing");
const NodeGeocoder = require("node-geocoder");
const fetch = require("node-fetch");

// Configure OpenStreetMap geocoder
const options = {
    provider: "openstreetmap",
    httpAdapter: "https",
    formatter: null,
    fetch: function (url, opts) {
        opts.headers = {
            ...opts.headers,
            "User-Agent": "wanderlust-clone-by-nikki (nikki@example.com)"
        };

        return fetch(url, opts);
    }
};

const geocoder = NodeGeocoder(options);

// Index - Display and filter listings
module.exports.index = async (req, res) => {
    const { category, search } = req.query;
    const filter = {};

    // Filter by category
    if (category === "Trending") {
        filter.isTrending = true;
    } else if (category) {
        const validCategories = [
            "Rooms",
            "Iconic Cities",
            "Mountains",
            "Castles",
            "Pools",
            "Camping",
            "Farms",
            "Arctic"
        ];

        if (validCategories.includes(category)) {
            filter.category = category;
        }
    }

    // Search listing title, destination, or country
    if (typeof search === "string" && search.trim()) {
        const escapedSearch = search.trim().replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const searchRegex = new RegExp(escapedSearch, "i");

        filter.$or = [
            { title: searchRegex },
            { location: searchRegex },
            { country: searchRegex }
        ];
    }

    const allListings = await Listing.find(filter);

    res.render("listings/index", {
        allListings,
        selectedCategory: category || "",
        searchQuery: typeof search === "string" ? search : ""
    });
};

// New listing form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// Create listing
module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);

    newListing.owner = req.user._id;

    // Unchecked HTML checkboxes are omitted from the request
    newListing.isTrending =
        req.body.listing.isTrending === "true";

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

// Show a specific listing
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

    let coordinates = null;

    try {
        const geoData = await geocoder.geocode(
            `${listing.location}, ${listing.country}`
        );

        if (geoData.length > 0) {
            coordinates = [
                geoData[0].latitude,
                geoData[0].longitude
            ];
        }
    } catch (err) {
        console.error("Geocoding error:", err.message);
    }

    // Fallback coordinates if geocoding fails
    if (!coordinates) {
        coordinates = [28.6139, 77.2090];
    }

    res.render("listings/show.ejs", {
        listing,
        coordinates
    });
};

// Edit listing form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist.");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
};

// Update listing
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    const listingData = {
        ...req.body.listing,
        isTrending: req.body.listing.isTrending === "true"
    };

    const listing = await Listing.findByIdAndUpdate(
        id,
        listingData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!listing) {
        req.flash("error", "Listing does not exist.");
        return res.redirect("/listings");
    }

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

// Delete listing
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
