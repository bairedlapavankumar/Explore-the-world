const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'owner', 'admin'],
        default: 'user'
    }
});

// Apply passportLocalMongoose plugin to userSchema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
