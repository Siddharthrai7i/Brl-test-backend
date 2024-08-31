const express = require("express");
const {
  checkTime,
} = require("../controller/authController");
const feedbackController = require("../controller/feedbackController");
const questionController = require("../controller/questionController");
const userController = require("../controller/userController");
const utilController = require("../controller/utilController");
const router = express.Router();
//const rateLimiter = require("../middleware/rate_limiter").rateLimiter;
const { body } = require("express-validator");

// @route   POST /get-questions
// @desc    Get 10 random questions
router.get(
  "/get-questions",
  checkTime,
  // rateLimiter,
  questionController.getQuestions
);

// @route   POST /return-questions
// @desc    Get 10 random questions
router.get(
  "/return-questions",
  checkTime,
  // rateLimiter,
  questionController.returnQuestions
);

// @route   POST /submit-responses
// @desc    Store selected answers
router.post(
  "/submit-responses",
  checkTime,
  // rateLimiter,
  questionController.saveResponses
);

// @route   POST /end-test
// @desc    Store selected answers
router.post(
  "/end-test",
  checkTime,
  // rateLimiter,
  questionController.endTest
);

// @route   POST /submit-feedback
// @desc    records feedback
router.post(
  "/submit-feedback",
  // rateLimiter,
  [
    body("quality", "Please select the quality good/average/bad").exists(),
    body("name", "enter your name").exists(),
    body("email", "email is required").isEmail(),
    body("feedback", "please enter feedback").isString(),
  ],
  utilController.validateRequest,
  feedbackController.addFeedback
);

router.get(
  "/getResult/:email",
  questionController.getResult
);

router.patch("/unfairAttempt", /*rateLimiter,*/ userController.unfair);

module.exports = router;
