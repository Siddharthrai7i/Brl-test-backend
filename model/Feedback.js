const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  quality: String,
  name: String,
  email: String,
  feedback: String,
});

module.exports = Feedback = mongoose.model("Feedback", feedbackSchema);
