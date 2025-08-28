// review schema
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: {
        type: String,
        required: [true, "Comment is required."],
        minlength: [5, "Comment should be at least 5 characters long."]
    },
    rating: {
        type: Number,
        required: [true, "Rating is required."],
        min: 1,
        max: 5
    },
    author : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    createdAt: {
        type: Date,
        default: Date.now() 
    }
});


module.exports = mongoose.model("Review", reviewSchema);