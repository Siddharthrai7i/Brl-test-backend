const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    quality: String,
    name: String,
    email: String,
    feedback: String
})

module.exports = Feedback = mongoose.model("Feedback", userSchema);
