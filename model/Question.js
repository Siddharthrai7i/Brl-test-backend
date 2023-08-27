const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  set: {
    type: Number,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  one: {
    type: String,
    required: true,
  },
  two: {
    type: String,
    required: true,
  },
  three: {
    type: String,
    required: true,
  },
  four: {
    type: String,
    required: true,
  },
  correct: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum:["HTML/CSS","APTITUDE","AIML","PROGRAMMING","BLOCKCHAIN","NETWORKING","BONUS"]
  },
  isQuestionImage: {
    type: Boolean,
    required: true,
  },
  isOptionImage: {
    type: Boolean,
    required: true,
  },
  imageString: {
    type: String,
    default: undefined,
  },
});

module.exports = Question = mongoose.model("Question", QuestionSchema);
