const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true
    },
    options: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Option"
        }
    ]
});

module.exports = Question = mongoose.model('Question', QuestionSchema);