
const Joi = require("joi");

const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=60";

// ===========================
// Listing Validation Schema
// ===========================

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().trim().required(),

    description: Joi.string().allow("", null).default(""),

    location: Joi.string().trim().required(),

    country: Joi.string().trim().required(),

    price: Joi.number().required().min(0),

    // Listing category
    category: Joi.string()
      .valid(
        "Rooms",
        "Iconic Cities",
        "Mountains",
        "Castles",
        "Pools",
        "Camping",
        "Farms",
        "Arctic"
      )
      .default("Rooms"),

    // Trending status
    isTrending: Joi.boolean()
      .truthy("true")
      .falsy("false")
      .default(false),

    // Listing image
    image: Joi.object({
      filename: Joi.string().allow("", null).default(""),

      url: Joi.string()
        .uri({ scheme: ["http", "https"] })
        .allow("", null)
        .default(DEFAULT_IMAGE_URL),
    }).default({
      filename: "",
      url: DEFAULT_IMAGE_URL,
    }),
  }).required(),
});

// ===========================
// Review Validation Schema
// Supports nested and bracket-form fields
// ===========================

module.exports.reviewSchema = Joi.alternatives().try(
  Joi.object({
    review: Joi.object({
      rating: Joi.number().min(1).max(5).required(),
      comment: Joi.string().min(5).required(),
    }).required(),
  }),

  Joi.object({
    "review[rating]": Joi.number().min(1).max(5).required(),

    "review[comment]": Joi.string().min(5).required(),
  })
);
