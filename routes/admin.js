const express = require("express");
const questionController = require("../controller/questionController");
const userController = require("../controller/userController");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../model/User");
const utilController = require("../controller/utilController");

router.post("/check-answers", questionController.postCheckAnswers);

// @route   POST /add-question
// @desc    Add questions to database
// @access  Public
router.post("/add-question", questionController.addQuestions);

//get All Users
// router.post("/users", userController.getUsers);

// @route   POST /add-bonus-question
// @desc    Add bonus questions to database
// @access  Admin
router.post(
  "/add-bonus-question",
  [
    body("question", "Question is required").isString().exists(),
    body("one", "Option is required").isString().exists(),
    body("two", "Option is required").isString().exists(),
    body("three", "Option is required").isString().exists(),
    body("four", "Option is required").isString().exists(),
    body("correct", "Correct answer is required").isString().exists(),
    body("domain", "Domain is required").isString().exists(),
    body("isQuestionImage", "isImage is required").isBoolean().exists(),
    body("isOptionImage", "isImage is required").isBoolean().exists(),
  ],
  utilController.validateRequest,
  questionController.addBonusQuestions
);

router.get("/result", (req, res) => {
  User.aggregate([
    { $match: { responses: { $exists: true } } },
    {
      $unwind: {
        path: "$responses",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $lookup: {
        from: "questions",
        let: { questionid: { $toObjectId: "$responses.question" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$$questionid", "$_id"],
              },
            },
          },
        ],
        as: "correct",
      },
    },
    { $unwind: "$correct" },
    {
      $addFields: {
        score: {
          $cond: [{ $eq: ["$correct.correct", "$responses.response"] }, 4, -1],
        },
        aptitude: {
          $cond: [
            {
              $eq: ["$correct.category", "aptitude"],
            },
            {
              $cond: [
                { $eq: ["$correct.correct", "$responses.response"] },
                4,
                -1,
              ],
            },
            0,
          ],
        },
        html_css: {
          $cond: [
            {
              $eq: ["$correct.category", "html_css"],
            },
            {
              $cond: [
                { $eq: ["$correct.correct", "$responses.response"] },
                4,
                -1,
              ],
            },
            0,
          ],
        },
        general: {
          $cond: [
            {
              $eq: ["$correct.category", "general"],
            },
            {
              $cond: [
                { $eq: ["$correct.correct", "$responses.response"] },
                4,
                -1,
              ],
            },
            0,
          ],
        },
        programming: {
          $cond: [
            {
              $eq: ["$correct.category", "programming"],
            },
            {
              $cond: [
                { $eq: ["$correct.correct", "$responses.response"] },
                4,
                -1,
              ],
            },
            0,
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        phoneNumber: { $first: "$phoneNumber" },
        email: { $first: "$email" },
        rollNumber: { $first: "$rollNumber" },
        branch: { $first: "$branch" },
        skills: { $first: "$skills" },
        switchCounter: { $first: "$switchCounter" },
        score: { $sum: "$score" },
        aptitude: { $sum: "$aptitude" },
        html_css: { $sum: "$html_css" },
        general: { $sum: "$general" },
        programming: { $sum: "$programming" },
      },
    },
    {
      $out: "subject",
    },
  ])
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

const Test = require("../model/Time");
router.post("/make", (req, res) => {
  try {
    Test.create({
      title: "BRL Recruitment Test",
      startTime: Date.now(),
      endTime: Date.now(),
    });
    res.status(200).json({
      message: "success",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "failed",
    });
  }
});

module.exports = router;
