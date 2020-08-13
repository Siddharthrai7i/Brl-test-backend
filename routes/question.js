const express = require("express");
const { authStudent } = require("../controller/authController");
const questionController = require("../controller/questionController");
const router = express.Router();
const {body} = require("express-validator");

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

// @route   POST /submit-responses
// @desc    Store selected answers
// @access  Private
router.post(
    "/submit-responses",
    authStudent,
    questionController.saveResponses
);

// @route   POST /submit-feedback
// @desc    records feedback
// @access  Private
router.post(
  "/submit-feedback",
  [authStudent, [
    body("quality", "Please select the quality good/average/bad").exists(),
    body("name", "enter your name").exists(),
    body("email", "email is required").isEmail(),
    body("feedback", "please enter feedback").isString()
  ]],
  questionController.saveFeedback
);

module.exports = router;
