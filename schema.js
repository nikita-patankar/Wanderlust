const Joi = require('joi');

const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmlsbGF8ZW58MHx8MHx8fDA%3D";

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            filename: Joi.string().allow('', null),
            url: Joi.string().pattern(/^https?:\/\//).allow('', null).default(DEFAULT_IMAGE_URL)
        }).default({
            filename: '',
            url: DEFAULT_IMAGE_URL
        })
    }).required()
});

module.exports.reviewSchema = Joi.alternatives().try(
    Joi.object({
        review: Joi.object({
            rating: Joi.number().min(1).max(5).required(),
            comment: Joi.string().min(5).required()
        }).required()
    }),
    Joi.object({
        "review[rating]": Joi.number().min(1).max(5).required(),
        "review[comment]": Joi.string().min(5).required()
    })
);
