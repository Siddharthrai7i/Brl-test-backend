const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true
    },
    correct: {
        type: Boolean,
        required: true
    }
});

module.exports = Options = mongoose.model('Option', QuestionSchema);