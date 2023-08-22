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
    // console.log(req.query.category);
    // console.log(user.questions);
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

exports.domain_quiz = async (req, res) => {
  const selectedDomain1 = req.query.choice1;
  const selectedDomain2 = req.query.choice2;
  console.log(req.query.choice1, " ", req.query.choice2);

  if (!selectedDomain1 || !selectedDomain2) {
    return res.status(400).send("Invalid selection");
  }

  try {
    // const questionsDomain1 = await BonusQuestion.find({ domain: selectedDomain1 });
    // const questionsDomain2 = await BonusQuestion.find({ domain: selectedDomain2 });
    var questions = await BonusQuestion.find({
      $or: [{ domain: selectedDomain1 }, { domain: selectedDomain2 }],
    });
    
    questions.forEach((ele) => {
      questions["question"] = ele["question"];
      questions["one"] = ele["one"];
      questions["two"] = ele["two"];
      questions["three"] = ele["three"];
      questions["four"] = ele["four"];
      questions["isQuestionImage"] = ele["isQuestionImage"];
      questions["isOptionImage"] = ele["isOptionImage"];
      questions["imageString"] = ele["imageString"];
    });

    // const allQuestions = [...questionsDomain1, ...questionsDomain2];
    console.log(questions);
    if (questions.length === 0) {
      return res
        .status(404)
        .send("No bonus questions found for the selected domains");
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//accept responses for bonus questions
exports.bonusResponses = async (req, res) => {
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
    console.log("subs", subs);
    let resp = [];
    console.log("user.response", user.responses);
    if (typeof user.responses !== "undefined" && user.responses.length > 0) {
      resp = [...user.responses];
    }
    console.log("resp", resp);
    var respOb = {};
    resp.forEach((ele) => {
      respOb[ele["question"]] = ele["response"];
      respOb[ele["question"]] = ele["domain"];
    });
    console.log("respOb", respOb);
    let subsOb = {};
    subs.forEach((ele) => {
      subsOb[ele["question"]] = ele["response"];
    });
    console.log("subsOb", subsOb);

    let respObj = {
      ...respOb,
      ...subsOb,
    };
    console.log("respOb", respObj);

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
    res.status(500).json({ message: "Server Error" });
  }
};
