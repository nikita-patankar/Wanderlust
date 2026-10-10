
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      url: {
        type: String,
        default: "",
      },
      filename: {
        type: String,
        default: "",
      },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Rooms",
        "Iconic Cities",
        "Mountains",
        "Castles",
        "Pools",
        "Camping",
        "Farms",
        "Arctic",
      ],
      default: "Rooms",
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Delete associated reviews when a listing is deleted.
listingSchema.post("findOneAndDelete", async function (listing) {
  if (listing && listing.reviews && listing.reviews.length > 0) {
    await Review.deleteMany({
      _id: { $in: listing.reviews },
    });

    console.log("Associated reviews deleted successfully.");
  }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
