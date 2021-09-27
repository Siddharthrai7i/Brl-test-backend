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
  const user = await User.findById(req.user.id);
  console.log(req.query.category);
  console.log(user.questions);
  // If user already has the questions
  if (user.questions.length != 0) {
    return res.redirect("/student/return-questions");
  }

  try {
    const res_questions = await Question.aggregate([
      {
        $facet: {
          html: [
            { $match: { category: "html" } },
            { $sample: { size: 5 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
              },
            },
          ],
          css: [
            { $match: { category: "css" } },
            { $sample: { size: 5 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
              },
            },
          ],
          io: [
            { $match: { category: "io" } },
            { $sample: { size: 5 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
              },
            },
          ],
          blockchain: [
            { $match: { category: "blockchain" } },
            { $sample: { size: 5 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
              },
            },
          ],
          pipeline: [
            { $match: { category: "pipeline" } },
            { $sample: { size: 1 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
              },
            },
          ],
          time: [
            { $match: { category: "time" } },
            { $sample: { size: 1 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
              },
            },
          ],
          series: [
            { $match: { category: "series" } },
            { $sample: { size: 1 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
              },
            },
          ],
          coding: [
            { $match: { category: "coding" } },
            { $sample: { size: 2 } },
            {
              $project: {
                _id: 1,
                question: 1,
                options: ["$one", "$two", "$three", "$four"],
              },
            },
          ],
          c: [
            { $match: { category: "c" } },
            { $sample: { size: 5 } },
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

    const temp_html = await res_questions[0]["html"].map((item) =>
      item._id.toString()
    );

    const temp_css = await res_questions[0]["css"].map((item) =>
      item._id.toString()
    );

    const temp_io = await res_questions[0]["io"].map((item) =>
      item._id.toString()
    );

    const temp_block = await res_questions[0]["blockchain"].map((item) =>
      item._id.toString()
    );
    const temp_pipe = await res_questions[0]["pipeline"].map((item) =>
      item._id.toString()
    );
    const temp_time = await res_questions[0]["time"].map((item) =>
      item._id.toString()
    );
    const temp_coding = await res_questions[0]["coding"].map((item) =>
      item._id.toString()
    );
    const temp_series = await res_questions[0]["series"].map((item) =>
      item._id.toString()
    );

    const temp_lang = await res_questions[0]["c"].map((item) =>
      item._id.toString()
    );

    let temp_questions_arr = [
      ...temp_html,
      ...temp_lang,
      ...temp_css,
      ...temp_io,
      ...temp_block,
      ...temp_pipe,
      ...temp_time,
      ...temp_coding,
      ...temp_series,
    ];
    user.questions = temp_questions_arr;
    user.save();

    let ret_questions = [
      ...res_questions[0].html,
      ...res_questions[0].css,
      ...res_questions[0].io,
      ...res_questions[0].blockchain,
      ...res_questions[0].c,
      ...res_questions[0].pipeline,
      ...res_questions[0].time,
      ...res_questions[0].coding,
      ...res_questions[0].series,
    ];
    console.log(ret_questions);
    return res
      .status(200)
      .json({ res_questions: ret_questions, time: req.time });
  } catch (err) {
    return res.status(500).json({ err: "server error" });
  }
};

// to add questions
exports.addQuestions = async (req, res) => {
  const { question, one, two, three, four, correct } = req.body;

  try {
    const new_question = new Question({
      question,
      one,
      two,
      three,
      four,
      correct,
    });

    await new_question.save();

    return res.status(200).json({ msg: "Question Saved" });
  } catch (err) {
    if (err) {
      res.status(500).json({ error: "Server Error" });
    }
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
