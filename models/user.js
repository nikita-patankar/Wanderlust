const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    }
});

userSchema.plugin(
    passportLocalMongoose.default || passportLocalMongoose,
    {
        usernameField: "email",
        usernameUnique: false
    }
);

module.exports = mongoose.model("User", userSchema);