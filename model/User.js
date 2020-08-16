const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    rollNumber: {
      type: Number,
    },
    branch: {
      type: String,
    },
    studentNumber: {
      type: Number,
    },
    whatsAppNumber: {
      type: Number,
    },
    github: {
      type: String,
    },
    behance: {
      type: String,
    },
    skills: {
      type: String,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    switchCounter: {
      type: Number,
      default: 0,
    },
    questions: [
      {
        type: String,
      },
    ],
    responses: [
      {
        question: {
          type: String,
        },
        response: {
          type: String,
        },
        status: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = User = mongoose.model("User", userSchema);
