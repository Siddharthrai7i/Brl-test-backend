const express = require("express");
const {
  // checkEndTime,
  // checkStartTime,
  // remainingTime,
  checkTime,
} = require("../controller/authController");
const feedbackController = require("../controller/feedbackController");
const questionController = require("../controller/questionController");
const userController = require("../controller/userController");
const utilController = require("../controller/utilController");
const router = express.Router();
const { body } = require("express-validator");

// @route   POST /get-questions
// @desc    Get 10 random questions
router.get(
  "/get-questions",
  // checkStartTime,
  // remainingTime,
  checkTime,
  questionController.getQuestions
);

// @route   POST /return-questions
// @desc    Get 10 random questions
router.get(
  "/return-questions",
  // checkStartTime,
  // remainingTime,
  checkTime,
  questionController.returnQuestions
);

// @route   POST /submit-responses
// @desc    Store selected answers
router.post(
  "/submit-responses",
  // checkEndTime,
  checkTime,
  questionController.saveResponses
);

// @route   POST /end-test
// @desc    Store selected answers
router.post(
  "/end-test",
  // checkEndTime,
  checkTime,
  questionController.endTest
);

// @route   POST /submit-feedback
// @desc    records feedback
router.post(
  "/submit-feedback",
  [
    body("quality", "Please select the quality good/average/bad").exists(),
    body("name", "enter your name").exists(),
    body("email", "email is required").isEmail(),
    body("feedback", "please enter feedback").isString(),
  ],
  utilController.validateRequest,
  feedbackController.addFeedback
);

router.patch("/unfairAttempt", userController.unfair);

router.get("/get-bonus-questions", questionController.getBonusQuestions);

router.post(
  "/submit-bonus-responses",
  checkTime,
  questionController.bonusResponses
);

module.exports = router;
