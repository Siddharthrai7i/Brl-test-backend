const express = require("express");
const questionController = require("../controller/questionController");
const userController = require("../controller/userController");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../model/User");
const utilController = require("../controller/utilController");
const mongoose = require('mongoose');

// router.post("/check-answers", questionController.postCheckAnswers);

// @route   POST /add-question
// @desc    Add questions to database
// @access  Public
// router.post("/add-question", questionController.addQuestions);

//get All Users
// router.post("/users", userController.getUsers);




router.get("/result", (req, res) => {
  userController.aggregateUsers()
  .then(() => {
    return mongoose.connection.db.collection('results').find({}).toArray();
  })
  .then((result) => {
    return res.status(200).json({result})
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send("Error occurred during aggregation.");
  });
});

// const Test = require("../model/Time");
// router.post("/make", (req, res) => {
//   try {
//     Test.create({
//       title: "BRL Recruitment Test",
//       startTime: Date.now(),
//       endTime: Date.now(),
//     });
//     res.status(200).json({
//       message: "success",
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "failed",
//     });
//   }
// });


module.exports = router;
