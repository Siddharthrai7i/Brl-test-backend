const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    unique: true
  },
  startTime: Date,
  endTime: Date,
  description: String,
},
  { timestamps: true }
);

const Test = mongoose.model("Test", TestSchema);

module.exports = Test ;