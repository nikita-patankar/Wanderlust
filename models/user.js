const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// ✅ FIX: access .default from the new export format
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);