const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { string } = require("joi");

// Default image in case user doesn't upload one
const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmlsbGF8ZW58MHx8MHx8fDA%3D";

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,

  image: {
  url: String,
  filename: String
 },


  price: {
    type: Number,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  country: {
    type: String,
    required: true
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

// Middleware to delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing) {
    await Review.deleteMany({
      _id: { $in: listing.reviews }
    });
    console.log("Deleted associated reviews ✅");
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
