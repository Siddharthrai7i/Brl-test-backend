const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  set: {
    type: Number,
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
    enum:["HTML/CSS","APTITUDE","AIML","PROGRAMMING","BLOCKCHAIN","NETWORKING","FRONTEND","BACKEND","ML","DESIGNING","APP"]
  },
  isQuestionImage: {
    type: Boolean,
    required: true,
  },
  isOptionImage: {
    type: Boolean,
    required: true,
  },
});

module.exports = Question = mongoose.model("Question", QuestionSchema);
