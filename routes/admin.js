const express = require("express");
const questionController = require("../controller/questionController");
const userController = require("../controller/userController");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../model/User");

router.post("/check-answers", questionController.postCheckAnswers);

// @route   POST /add-question
// @desc    Add questions to database
// @access  Public
router.post("/add-question", questionController.addQuestions);

//get All Users
// router.post("/users", userController.getUsers);

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
                            $eq: ["$correct.category", "aptitude"] 
                        }, 
                        {   
                            $cond: [
                                { $eq: ["$correct.correct", "$responses.response"] }, 4, -1
                            ]
                        }, 0
                    ],
                },
                html_css: {
                    $cond: [
                        { 
                            $eq: ["$correct.category", "html_css"] 
                        }, 
                        {   
                            $cond: [
                                { $eq: ["$correct.correct", "$responses.response"] }, 4, -1
                            ]
                        }, 0
                    ],
                },
                general: {
                    $cond: [
                        { 
                            $eq: ["$correct.category", "general"] 
                        }, 
                        {   
                            $cond: [
                                { $eq: ["$correct.correct", "$responses.response"] }, 4, -1
                            ]
                        }, 0
                    ],
                },
                programming: {
                    $cond: [
                        { 
                            $eq: ["$correct.category", "programming"] 
                        }, 
                        {   
                            $cond: [
                                { $eq: ["$correct.correct", "$responses.response"] }, 4, -1
                            ]
                        }, 0
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
    ]).then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    });

});

module.exports = router;
