const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../model/User");
const Question = require("../model/Question");
const BonusQuestion = require("../model/BonusQuestions");

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
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json({ res_questions: result[0].questionsDetails, time: req.time });
};

// get 25 questions
exports.getQuestions = async (req, res, next) => {
  try {
    console.log("here in getQuestions");
    const user = await User.findById(req.user.id);

    // If user already has the questions
    if (user.questions.length != 0) {
      return res.redirect("/student/return-questions");
    }

    const res_questions = await Question.aggregate([
      {
        $facet: {
          aptitude: [
            { $match: { category: "aptitude" } },
            { $sample: { size: 10 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isImage: 1,
              },
            },
          ],
          html_css: [
            { $match: { category: "html_css" } },
            { $sample: { size: 10 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isImage: 1,
              },
            },
          ],
          programming: [
            { $match: { category: "programming" } },
            { $sample: { size: 10 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isImage: 1,
              },
            },
          ],
          general: [
            { $match: { category: "general" } },
            { $sample: { size: 10 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                isImage: 1,
              },
            },
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

    const temp_general = await res_questions[0]["general"].map((item) =>
      item._id.toString()
    );

    let temp_questions_arr = [
      ...temp_aptitude,
      ...temp_html_css,
      ...temp_programming,
      ...temp_general,
    ];

    user.questions = temp_questions_arr;
    user.save();

    let ret_questions = [
      ...res_questions[0].aptitude,
      ...res_questions[0].html_css,
      ...res_questions[0].programming,
      ...res_questions[0].general,
    ];

    // console.log(ret_questions);

    return res
      .status(200)
      .json({ res_questions: ret_questions, time: req.time });
  } catch (err) {
    return res.status(500).json({ err: "Some error occured." });
  }
};

// to add questions
exports.addQuestions = async (req, res) => {
  try {
    const { question, one, two, three, four, correct, category, isImage } =
      req.body;
    const questionObj = new BonusQuestion({
      question: question,
      one: one,
      two: two,
      three: three,
      four: four,
      correct: correct,
      category: category,
      isImage: isImage,
      imageString: req.body.imageString ? imageString : "",
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

    console.log(selected);

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

    respOb = {};
    resp.forEach((ele) => {
      respOb[ele["question"]] = ele["response"];
    });

    subsOb = {};
    subs.forEach((ele) => {
      subsOb[ele["question"]] = ele["response"];
    });

    respObj = {
      ...respOb,
      ...subsOb,
    };
    console.log("respObj", respObj);

    let finalResp = [];
    Object.keys(respObj).forEach((ele) => {
      ob = {};
      ob["question"] = ele;
      ob["response"] = respObj[ele];
      ob["status"] = "saved";
      finalResp.push(ob);
    });
    console.log("finalResp", finalResp);

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

exports.addBonusQuestions = async (req, res) => {
  try {
    const {
      question,
      one,
      two,
      three,
      four,
      correct,
      domain,
      isOptionImage,
      isQuestionImage,
    } = req.body;
    const questionObj = new BonusQuestion({
      question: question,
      one: one,
      two: two,
      three: three,
      four: four,
      correct: correct,
      domain: domain,
      isOptionImage: isOptionImage,
      isQuestionImage: isQuestionImage,
      imageString: isQuestionImage ? req.body.imageString : "",
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
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

exports.returnBonusQuestions = async (req, res, next) => {
  var result = await User.aggregate([
    {
      $match: { _id: ObjectId(req.user.id) },
    },
    {
      $addFields: {
        bonusQuestionIds: {
          $map: {
            input: "$bonus_questions",
            as: "bonusQuestionId",
            in: { $toObjectId: "$$bonusQuestionId" },
          },
        },
      },
    },
    {
      $lookup: {
        from: "bonus_questions",
        localField: "bonusQuestionIds",
        foreignField: "_id",
        as: "bonusQuestions",
      },
    },
    {
      $project: {
        bonusQuestions: 1,
      },
    },
  ]);
  result = result[0]["bonusQuestions"];

  let finalResp = [];

  result.forEach((item) => {
    obj = {};
    obj["_id"] = item._id,
    obj["question"]= item.question,
    obj["options"]= [item.one, item.two, item.three, item.four],
    obj["domain"]= item.domain,
    obj["isOptionImage"]= item.isOptionImage,
    obj["isQuestionImage"] =item.isQuestionImage,
    obj["imageString"] =item.imageString,
    finalResp.push(obj);
  });

  return res
    .status(200)
    .json({ res_questions: finalResp, time: req.time });
};

exports.getBonusQuestions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const selectedDomain1 = req.query.choice1;
    const selectedDomain2 = req.query.choice2;

    if (!selectedDomain1 || !selectedDomain2) {
      return res.status(400).send("Invalid selection");
    }

    if (user.bonus_questions.length != 0) {
      return res.redirect("/student/return-bonus-questions");
    }

    const res_questions = await BonusQuestion.aggregate([
      {
        $facet: {
          bonus: [
            {
              $match: {
                $or: [{ domain: selectedDomain1 }, { domain: selectedDomain2 }],
              },
            },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
                domain: 1,
                isQuestionImage: 1,
                isOptionImage: 1,
                imageString: 1,
              },
            },
          ],
        },
      },
    ]);

    const questions = await res_questions[0]["bonus"].map((item) =>
      item._id.toString()
    );
    let temp_questions_arr = [...questions];

    user.bonus_questions = temp_questions_arr;
    user.save();

    return res
      .status(200)
      .json({ res_questions: res_questions[0].bonus, time: req.time });
  } catch (err) {
    return res.status(500).json({ err: "Some error occured." });
  }
};

//accept responses for bonus questions
exports.bonusResponses = async (req, res) => {
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
    if (
      typeof user.bonus_responses !== "undefined" &&
      user.bonus_responses.length > 0
    ) {
      resp = [...user.bonus_responses];
    }

    var respOb = {};
    resp.forEach((ele) => {
      respOb[ele["question"]] = ele["response"];
      respOb[ele["question"]] = ele["domain"];
    });

    let subsOb = {};
    subs.forEach((ele) => {
      subsOb[ele["question"]] = ele["response"];
    });

    let respObj = {
      ...respOb,
      ...subsOb,
    };
    console.log(respObj);

    let finalResp = [];
    Object.keys(respObj).forEach((ele) => {
      ob = {};
      ob["question"] = ele;
      ob["response"] = respObj[ele];
      ob["status"] = "saved";
      finalResp.push(ob);
    });
    console.log(finalResp);

    user.bonus_responses = finalResp;
    await user.save();
    return res.status(200).json({ message: "Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
