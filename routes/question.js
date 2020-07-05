const express = require("express");
const { authStudent } = require("../controller/authController");
const questionController = require("../controller/questionController");
const router = express.Router();
router.post("/check-answers", questionController.postCheckAnswers);

// @route   POST /add-question
// @desc    Add questions to database
// @access  Public
router.post("/add-question", questionController.addQuestions);

// @route   POST /get-questions
// @desc    Get 10 random questions
// @access  Private
router.get("/get-questions", authStudent, questionController.getQuestions);

// @route   POST /return-questions
// @desc    Get 10 random questions
// @access  Private
router.get(
  "/return-questions",
  authStudent,
  questionController.returnQuestions
);

// @route   POST /return-questions
// @desc    Get 10 random questions
// @access  Private
router.post(
    "/submit-responses",
    authStudent,
    questionController.saveResponses
);


module.exports = router;
