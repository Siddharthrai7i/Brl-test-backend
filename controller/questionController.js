const jwt = require("jsonwebtoken");
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../model/User");
const Question = require("../model/Question");

// exports.postQuestions =

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
  return res.status(200).json({ res_questions: result[0].questionsDetails });
};

exports.getQuestions = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // If user already has the questions
  if (user.questions.length === 10) {
    return res.redirect("/return-questions");
  }

  const all_questions = await Question.find();

  // get total number of docs
  const total_docs = all_questions.length;

  nos_list = [];
  for (let i = 0; i < total_docs; i++) nos_list.push(i);

  random_list = [];
  for (let i = 0; i < 10; i++) {
    let s1 = nos_list.length;
    let s2 = Math.random() * s1;
    let res = Math.floor(s2);

    let randomNumber = nos_list[res];
    nos_list.splice(res, 1);
    random_list.push(randomNumber);
  }
  /////////////////////////

  res_questions = [];
  temp_questions_arr = [];

  for (let i = 0; i < random_list.length; i++) {
    temp_questions_arr.push(all_questions[random_list[i]]._id);

    const { _id, question, one, two, three, four } = all_questions[
      random_list[i]
    ];
    question_object = {
      _id,
      question,
      options: [one, two, three, four],
    };

    res_questions.push(question_object);
  }

  user.questions = temp_questions_arr;
  user.save();

  return res.status(200).json({ res_questions });
};

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
