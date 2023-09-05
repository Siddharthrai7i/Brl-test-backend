const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../model/User");
const Question = require("../model/Question");

exports.postCheckAnswers = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) {
    const error = new Error("Token not provided");
    error.statusCode = 401;
    return next(error);
  }
  token = token.slice(7, token.length);
  jwt.verify(token, process.env.TOKEN_SECRET, async (err, rollNumber) => {
    if (err) {
      const error = new Error(err);
      error.statusCode = 401;
      return next(error);
    }
    let i, j;
    let score = 0;
    const student = await Student.findOne({ rollNumber: rollNumber }).catch(
      (err) => {
        const error = new Error(err);
        return next(error);
      }
    );
    if (!student) {
      const error = new Error("Student not found");
      return next(error);
    }
    const answers = req.body.answers;
    for (i = 0; i < answers.length; i++) {
      const question = await Question.findById(answers[i].question).catch(
        (err) => {
          const error = new Error(err);
          return next(error);
        }
      );
      if (!question) {
        const error = new Error(`Invalid question ID: ${answers[i].question}`);
        return next(error);
      }
      const optionID = question.options;
      for (j = 0; j < optionID.length; j++) {
        if (answers[i].answer == optionID[j]) {
          const option = await Option.findById(optionID[j]);
          if (option.correct) {
            score++;
          }
        }
      }
    }
    student.score = score;
    await student.save().catch((err) => {
      const error = new Error(err);
      return next(error);
    });
    res.status(200).json({
      message: "Answers checked",
    });
  });
};

exports.returnQuestions = async (req, res, next) => {
  const result = await User.aggregate([
    { $match: { _id: ObjectId(req.user.id) } },
    {
      $lookup: {
        from: Question.collection.name,
        let: { questionsId: "$questions" },
        as: "questionsDetails",
        pipeline: [
          {
            $match: {
              $expr: { $in: [{ $toString: "$_id" }, "$$questionsId"] },
            },
          },
          {
            $project: {
              _id: 1,
              question: 1,
              options: ["$one", "$two", "$three", "$four"],
              isOptionImage: 1,
              isQuestionImage: 1,
              imageString: 1,
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json({ length: result[0].questionsDetails.length, res_questions: result[0].questionsDetails, time: req.time });
};

// get 25 questions
exports.getQuestions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const option1 = req.query.choice1 ?? "";
    const option2 = req.query.choice2 ?? "";
    
    user.choices = [option1.toUpperCase(),option2.toUpperCase()];

    // Generate a random number between 1 and 2
    const set = Math.floor(Math.random() * 2) + 1;

    // If user already has the questions
    if (user.questions.length != 0) {
      return res.redirect("/student/return-questions");
    }

    const res_questions = await Question.aggregate([
      {
        $facet: {
          aptitude: [
            {
              $match: {
                $and: [{ category: "aptitude".toUpperCase() }, { set: set }],
              },
            },
            {
              $project: {
                _id: 1,
                category: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isOptionImage: 1,
                isQuestionImage: 1,
              },
            },
            {
              $addFields: {
                isBonus: false
              }
            }
          ],
          html_css: [
            {
              $match: {
                $and: [{ category: "html/css".toUpperCase() }, { set: set }],
              },
            },
            {
              $project: {
                _id: 1,
                category: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isOptionImage: 1,
                isQuestionImage: 1,
              },
            },
            {
              $addFields: {
                isBonus: false
              }
            }
          ],
          programming: [
            {
              $match: {
                $and: [{ category: "programming".toUpperCase() }, { set: set }],
              },
            },
            {
              $project: {
                _id: 1,
                category: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isOptionImage: 1,
                isQuestionImage: 1,
              },
            },
            {
              $addFields: {
                isBonus: false
              }
            }
          ],
          networking: [
            {
              $match: {
                $and: [{ category: "networking".toUpperCase() }, { set: set }],
              },
            },
            {
              $project: {
                _id: 1,
                category: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isOptionImage: 1,
                isQuestionImage: 1,
              },
            },
            {
              $addFields: {
                isBonus: false
              }
            }
          ],
          aiml: [
            {
              $match: {
                $and: [{ category: "aiml".toUpperCase() }, { set: set }],
              },
            },
            {
              $project: {
                _id: 1,
                category: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isOptionImage: 1,
                isQuestionImage: 1,
              },
            },
            {
              $addFields: {
                isBonus: false
              }
            }
          ],
          blockchain: [
            {
              $match: {
                $and: [{ category: "blockchain".toUpperCase() }, { set: set }],
              },
            },
            {
              $project: {
                _id: 1,
                category: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isOptionImage: 1,
                isQuestionImage: 1,
              },
            },
            {
              $addFields: {
               isBonus: false
              }
            }
          ],
          bonus: [
            {
              $match: {
                $and: [{ category: { $in: [option1.toUpperCase(), option2.toUpperCase()] } }, { set: set }],
              }
            },
            {
              $project: {
                _id: 1,
                category: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isOptionImage: 1,
                isQuestionImage: 1,

              }
            },
            {
              $addFields: {
                isBonus: true
              }
            }
          ],
        },
      },
    ]);

    const temp_aptitude = await res_questions[0]["aptitude"].map((item) =>
      item._id.toString()
    );

    const temp_html_css = await res_questions[0]["html_css"].map((item) =>
      item._id.toString()
    );

    const temp_programming = await res_questions[0]["programming"].map((item) =>
      item._id.toString()
    );

    const temp_aiml = await res_questions[0]["aiml"].map((item) =>
      item._id.toString()
    );

    const temp_networking = await res_questions[0]["networking"].map((item) =>
      item._id.toString()
    );

    const temp_blockchain = await res_questions[0]["blockchain"].map((item) =>
      item._id.toString()
    );

    const temp_bonus = await res_questions[0]["bonus"].map((item) =>
      item._id.toString()
    );

    let temp_questions_arr = [
      ...temp_aptitude,
      ...temp_html_css,
      ...temp_programming,
      ...temp_blockchain,
      ...temp_networking,
      ...temp_aiml,
      ...temp_bonus,
    ];

    user.questions = temp_questions_arr;
    user.save();

    let ret_questions = [
      ...res_questions[0].aptitude,
      ...res_questions[0].html_css,
      ...res_questions[0].programming,
      ...res_questions[0].blockchain,
      ...res_questions[0].networking,
      ...res_questions[0].aiml,
      ...res_questions[0].bonus,
    ];

    return res
      .status(200)
      .json({ length: ret_questions.length, res_questions: ret_questions, time: req.time });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "Some error occured." });
  }
};

// to add questions
exports.addQuestions = async (req, res) => {
  try {
    const {
      set,
      question,
      one,
      two,
      three,
      four,
      correct,
      category,
      isOptionImage,
      isQuestionImage,
    } = req.body;
    const questionObj = new Question({
      set: parseInt(set),
      question: question,
      one: one,
      two: two,
      three: three,
      four: four,
      correct: correct,
      category: category.toUpperCase(),
      isQuestionImage: isQuestionImage,
      isOptionImage: isOptionImage,
      imageString: req.body.isQuestionImage ? req.imageString : "",
    });

    await questionObj
      .save()
      .then(() => {
        return res.status(200).json({ message: "success" });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ message: "Internal Server Error" });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// store responses
exports.saveResponses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    selected = req.body.responses;

    selected.forEach((element) => {
      if (element.response === 1) {
        element.response = "one";
      } else if (element.response === 2) {
        element.response = "two";
      } else if (element.response === 3) {
        element.response = "three";
      } else if (element.response === 4) {
        element.response = "four";
      } else {
        element.response = "negative";
      }
    });

    let subs = [...selected];
    let resp = [];
    if (typeof user.responses !== "undefined" && user.responses.length > 0) {
      resp = [...user.responses];
    }

    let respOb = {};
    resp.forEach((ele) => {
      respOb[ele["question"]] = ele["response"];
    });

    let subsOb = {};
    subs.forEach((ele) => {
      subsOb[ele["question"]] = ele["response"];
    });

    let respObj = {
      ...respOb,
      ...subsOb,
    };

    let finalResp = [];
    Object.keys(respObj).forEach((ele) => {
      ob = {};
      ob["question"] = ele;
      ob["response"] = respObj[ele];
      ob["status"] = "saved";
      finalResp.push(ob);
    });

    user.responses = finalResp;
    await user.save();
    return res.status(200).json({ msg: "Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

// endTest
exports.endTest = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const selected = req.body.responses;

    selected.forEach((element) => {
      if (element.response === 1) {
        element.response = "one";
      } else if (element.response === 2) {
        element.response = "two";
      } else if (element.response === 3) {
        element.response = "three";
      } else if (element.response === 4) {
        element.response = "four";
      } else {
        element.response = "negative";
      }
    });

    let subs = [...selected];
    let resp = [];
    if (typeof user.responses !== "undefined" && user.responses.length > 0) {
      resp = [...user.responses];
    }

    const previousAttempted = [];
    resp.forEach((ele) => {
      previousAttempted.push(ele["question"]);
    });

    const respToSave = subs.filter((ele) => {
      return !previousAttempted.includes(ele.question);
    });

    respToSave.forEach((ele) => {
      ele.status = "marked";
    });

    const finalResp = [...resp, ...respToSave];

    user.responses = finalResp;
    await user.save();
    return res.status(200).json({ msg: "Success" });
  } catch (err) {
    return res.status(500).json({ error: "Server Error" });
  }
};