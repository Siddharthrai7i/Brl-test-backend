const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    rollNumber: Number,
    branch: String,
    switchCounter: Number,
    totalQuestions: Number,
    nonBonusCount: Number,
    bonusCount: Number,
    score: Number,
    aptitude: Number,
    html_css: Number,
    programming: Number,
    networking: Number,
    aiml: Number,
    blockchain: Number,
    bonus: Number,
    normalizedScore: Number
}, { collection: 'results' });

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
