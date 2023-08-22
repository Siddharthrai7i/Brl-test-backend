const mongoose = require("mongoose");

const BonusQuestionSchema = new mongoose.Schema(
  {
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
    domain: {
      type: String,
      required: true,
      enum:["Frontend","Backend","App","ML","Designing"]
    },
    isQuestionImage: {
      type: Boolean,
      required: true,
    },
    isOptionImage: {
        type: Boolean,
        required: true,
      },
    imageString:{
        type: String,
        default: undefined
    }
  },
  { timestamps: true }
);

module.exports = BonusQues = mongoose.model(
  "Bonus_Question",
  BonusQuestionSchema
);
