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


router.get("/result", (req, res) => {
  User.aggregate([
    {
      $match: { responses: { $exists: true } }
    },
    {
      $unwind: {
        path: "$responses",
        preserveNullAndEmptyArrays: false,
      }
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
              }
            }
          }
        ],
        as: "correct"
      }
    },
    { $unwind: "$correct" },
    {
      $addFields: {
        scoreChange: {
          $cond: [
            { $eq: ["$correct.category", "bonus".toUpperCase()] },
            {
              $cond: [
                { $eq: ["$correct.correct", "$responses.response"] },
                4, // +4 for correct answer in bonus category
                -1.00 // -1.25 for incorrect answer in bonus category
              ]
            },
            {
              $cond: [
                { $eq: ["$correct.correct", "$responses.response"] },
                4, // +4 for correct answer
                -0.25 // -0.25 for incorrect answer in other categories
              ]
            }
          ]
        }
      }
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
        score: { $sum: "$scoreChange" },
        aptitude: { $sum: { $cond: [ { $eq: ["$correct.category", "aptitude".toUpperCase()] }, "$scoreChange", 0 ] } },
        html_css: { $sum: { $cond: [ { $eq: ["$correct.category", "html/css".toUpperCase()] }, "$scoreChange", 0 ] } },
        programming: { $sum: { $cond: [ { $eq: ["$correct.category", "programming".toUpperCase()] }, "$scoreChange", 0 ] } },
        networking: { $sum: { $cond: [ { $eq: ["$correct.category", "networking".toUpperCase()] }, "$scoreChange", 0 ] } },
        aiml: { $sum: { $cond: [ { $eq: ["$correct.category", "aiml".toUpperCase()] }, "$scoreChange", 0 ] } },
        blockchain: { $sum: { $cond: [ { $eq: ["$correct.category", "blockchain".toUpperCase()] }, "$scoreChange", 0 ] } },
        bonus: { $sum: { $cond: [ { $eq: ["$correct.category", "bonus".toUpperCase()] }, "$scoreChange", 0 ] } }
      }
    }
  ]
  )
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
