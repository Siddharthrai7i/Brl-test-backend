const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: {
        type: String,
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
    questionNumber: {
        type: Number,
    }
});

module.exports = Question = mongoose.model('Question', QuestionSchema);
