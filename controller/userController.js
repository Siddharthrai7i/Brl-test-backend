const User = require("../model/User");

exports.addUser = async (req, res) => {
  const { name, rollNumber, email, branch, password, phoneNumber } = req.body;
  const emailExist = await User.findOne({ email: email });
  if (emailExist)
    return res.status(400).json({ error: "email already exists" });

  const rollNumberExists = await User.findOne({
    rollNumber: rollNumber,
  });
  if (rollNumberExists)
    return res.status(400).json({ error: "roll number already exists" });

  let user = new User({
    name,
    rollNumber,
    phoneNumber,
    email,
    branch,
    password,
  });

  await user.save();

  res.status(200).json({ user });
};

exports.unfair = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    var x = user.switchCounter;
    user.switchCounter = ++x;
    await user.save();
    res.status(200).json({
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(400);
  }
};

exports.aggregateUsers = () => {
  return new Promise((resolve, reject) => {
    // Stage 1: Match documents with responses
    const matchResponsesStage = {
      $match: { responses: { $exists: true } },
    };

    // Stage 2: Calculate counts
    const calculateCountsStage = {
      $addFields: {
        totalQuestions: { $size: "$questions" },
        choicesCount: {
          $reduce: {
            input: "$choices",
            initialValue: 0,
            in: {
              $cond: [
                { $ne: ["$$this", ""] },
                { $add: ["$$value", 1] },
                "$$value",
              ],
            },
          },
        },
      },
    };

    // Stage 3: Calculate bonus count
    const calculateBonusCountStage = {
      $addFields: {
        bonusCount: { $multiply: ["$choicesCount", 5] },
      },
    };

    // Stage 4: Calculate questions count
    const calculateNonBonusCountStage = {
      $addFields: {
        nonBonusCount: { $subtract: ["$totalQuestions", "$bonusCount"] },
      },
    };

    // Stage 5: Unwind responses
    const unwindResponsesStage = {
      $unwind: {
        path: "$responses",
        preserveNullAndEmptyArrays: false,
      },
    };

    // Stage 6: Lookup correct answers
    const lookupCorrectAnswersStage = {
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
    };

    // Stage 7: Unwind correct answers
    const unwindCorrectAnswersStage = { $unwind: "$correct" };

    // Stage 8: Match documents with non-empty choices
    const matchNonEmptyChoicesStage = {
      $match: {
        choices: { $elemMatch: { $ne: "" } },
      },
    };

    // Stage 9: Calculate score changes
    const calculateScoreChangesStage = {
      $addFields: {
        scoreChange: {
          $cond: [
            {
              $in: [
                "$correct.category",
                {
                  $ifNull: ["$choices", []],
                },
              ],
            },
            {
              $cond: [
                { $eq: ["$correct.correct", "$responses.response"] },
                5, // +5 for correct answer in the bonus categories
                -1.0, // -1.00 for incorrect answer in the bonus categories
              ],
            },
            {
              $cond: [
                { $eq: ["$correct.correct", "$responses.response"] },
                4, // +4 for correct answer
                -0.25, // -0.25 for incorrect answer in other categories
              ],
            },
          ],
        },
      },
    };

    // Stage 10: Group and calculate scores by category
    const groupAndCalculateScoresStage = {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        email: { $first: "$email" },
        rollNumber: { $first: "$rollNumber" },
        branch: { $first: "$branch" },
        switchCounter: { $first: "$switchCounter" },
        totalQuestions: { $first: "$totalQuestions" },
        nonBonusCount: { $first: "$nonBonusCount" },
        bonusCount: { $first: "$bonusCount" },
        score: { $sum: "$scoreChange" },
        aptitude: {
          $sum: {
            $cond: [
              { $eq: ["$correct.category", "aptitude".toUpperCase()] },
              "$scoreChange",
              0,
            ],
          },
        },
        html_css: {
          $sum: {
            $cond: [
              { $eq: ["$correct.category", "html/css".toUpperCase()] },
              "$scoreChange",
              0,
            ],
          },
        },
        programming: {
          $sum: {
            $cond: [
              { $eq: ["$correct.category", "programming".toUpperCase()] },
              "$scoreChange",
              0,
            ],
          },
        },
        networking: {
          $sum: {
            $cond: [
              { $eq: ["$correct.category", "networking".toUpperCase()] },
              "$scoreChange",
              0,
            ],
          },
        },
        aiml: {
          $sum: {
            $cond: [
              { $eq: ["$correct.category", "aiml".toUpperCase()] },
              "$scoreChange",
              0,
            ],
          },
        },
        blockchain: {
          $sum: {
            $cond: [
              { $eq: ["$correct.category", "blockchain".toUpperCase()] },
              "$scoreChange",
              0,
            ],
          },
        },
        bonus: {
          $sum: {
            $cond: [
              {
                $in: [
                  { $toUpper: "$correct.category" },
                  {
                    $map: {
                      input: "$choices",
                      as: "choice",
                      in: { $toUpper: "$$choice" },
                    },
                  },
                ],
              },
              "$scoreChange",
              0,
            ],
          },
        },
      },
    };

    // Stage 11: Calculate normalized score
    const calculateNormalizedScoreStage = {
      $addFields: {
        normalizedScore: {
          $cond: {
            if: { $gt: ["$bonusCount", 0] }, // Check if bonusCount is greater than 0
            then: {
              $multiply: [
                {
                  $divide: [
                    {
                      $add: [
                        {
                          $divide: [
                            {
                              $add: [
                                "$aptitude",
                                "$html_css",
                                "$programming",
                                "$networking",
                                "$blockchain",
                                "$aiml",
                              ],
                            },
                            {
                              $multiply: ["$nonBonusCount", 4],
                            },
                          ],
                        },
                        {
                          $divide: [
                            "$bonus",
                            {
                              $multiply: ["$bonusCount", 5],
                            },
                          ],
                        },
                      ],
                    },
                    2,
                  ],
                },
                100,
              ],
            },
            else: {
              multiply: [
                {
                  $divide: [
                    {
                      $add: [
                        "$aptitude",
                        "$html_css",
                        "$programming",
                        "$networking",
                        "$blockchain",
                        "$aiml",
                      ],
                    },
                    {
                      $multiply: ["$nonBonusCount", 4],
                    },
                  ],
                },
                100,
              ],
            },
          },
        },
      },
    };

    // Stage 12: Project desired fields
    const projectFieldsStage = {
      $project: {
        _id: 0,
        name: 1,
        email: 1,
        rollNumber: 1,
        branch: 1,
        switchCounter: 1,
        totalQuestions: 1,
        nonBonusCount: 1,
        bonusCount: 1,
        score: 1,
        aptitude: 1,
        html_css: 1,
        programming: 1,
        networking: 1,
        aiml: 1,
        blockchain: 1,
        bonus: 1,
        normalizedScore: 1,
      },
    };

    // Optional Stage 13: Output results to a collection
    const outputToResultsCollectionStage = {
      $out: "results",
    };

    const aggregationPipeline = [
      matchResponsesStage,
      calculateCountsStage,
      calculateBonusCountStage,
      calculateNonBonusCountStage,
      unwindResponsesStage,
      lookupCorrectAnswersStage,
      unwindCorrectAnswersStage,
      matchNonEmptyChoicesStage,
      calculateScoreChangesStage,
      groupAndCalculateScoresStage,
      calculateNormalizedScoreStage,
      projectFieldsStage,
      outputToResultsCollectionStage,
    ];

    User.aggregate(aggregationPipeline)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log(user);
    user.password = req.body.password;
    user
      .save()
      .then(() => {
        res.status(200).json({ message: "Password changed succesfully" });
      })
      .catch((err) => {
        console.log(err);
        res.status(400);
      });
  } catch (err) {
    console.log(err);
    res.status(400);
  }
};

exports.deleteUser = async (req, res) => {
  User.deleteOne({ email: req.body.email })
    .then(() => {
      req.status(200).json({ message: "success" });
    })
    .catch((err) => {
      console.log(err);
      req.status(400).json({ message: "failed" });
    })
    .catch((err) => {});
};

// {
//   $addFields: {
//     normalizedScore: {
//       $cond: {
//         if: { $gt: ["$bonusCount", 0] }, // Check if bonusCount is greater than 0
//         then: {
//           $divide: [
//             {
//               $add: [
//                 {
//                   $divide: [
//                     {
//                       $add: [
//                         "$aptitude",
//                         "$html_css",
//                         "$programming",
//                         "$networking",
//                         "$blockchain",
//                         "$aiml",
//                       ],
//                     },
//                     "$questionsCount",
//                   ],
//                 },
//                 "$bonus",
//               ],
//             },
//             "$bonusCount",
//           ],
//         },
//         else: {
//           $divide: [
//             {
//               $add: [
//                 {
//                   $divide: [
//                     {
//                       $add: [
//                         "$aptitude",
//                         "$html_css",
//                         "$programming",
//                         "$networking",
//                         "$blockchain",
//                         "$aiml",
//                       ],
//                     },
//                     "$questionsCount",
//                   ],
//                 },
//                 "$bonus",
//               ],
//             },
//             2, // Divide by 2 if bonusCount is not greater than 0
//           ],
//         },
//       },
//     },
//   },
// }
