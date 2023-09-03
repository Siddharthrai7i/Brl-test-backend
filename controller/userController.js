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
    User.aggregate([
      {
        $match: { responses: { $exists: true } },
      },
      {
        $addFields: {
          totalQuestions: { $size: "$questions" }, // Count the total number of questions for the user
        },
      },
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
        $match: {
          choices: {
            $elemMatch: { $ne: "" },
          },
        },
      },
      {
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
                  5, // +4 for correct answer in the dynamic category
                  -1.0, // -1.00 for incorrect answer in the dynamic category
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
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          email: { $first: "$email" },
          rollNumber: { $first: "$rollNumber" },
          branch: { $first: "$branch" },
          switchCounter: { $first: "$switchCounter" },
          totalQuestions: { $first: "$totalQuestions" },
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
      },
      {
        $addFields: {
          // Multiply the score by 4 and then normalize it to 100 based on the total number of questions
          normalizedScore: {
            $multiply: [
              100,
              { $divide: ["$score", { $multiply: ["$totalQuestions", 4] }] },
            ],
          },
        },
      },
      {
        $out: "results",
      },
    ])
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
