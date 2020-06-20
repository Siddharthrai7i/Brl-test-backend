const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true
    },
    options: [
        {
            option: {
                type: String,
                required: true
            },
            isCorrect: {
                type: Boolean,
                required: true
            }
        }
    ],
});

module.exports = Options = mongoose.model('Option', QuestionSchema);
