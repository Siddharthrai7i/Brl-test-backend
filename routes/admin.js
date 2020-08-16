const express = require("express");
const questionController = require("../controller/questionController");
const userController = require("../controller/userController");
const router = express.Router();
const { body } = require("express-validator");

router.post("/check-answers", questionController.postCheckAnswers);

// @route   POST /add-question
// @desc    Add questions to database
// @access  Public
router.post("/add-question", questionController.addQuestions);

//get All Users
// router.post("/users", userController.getUsers);

module.exports = router;
