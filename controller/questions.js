const jwt = require('jsonwebtoken');
const Student = require('../model/User');
const Question = require('../model/Question');
const Option = require('../model/Option');


// exports.postQuestions = 



exports.postCheckAnswers = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        const error = new Error('Token not provided');
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
        const student = await Student.findOne({ "rollNumber": rollNumber })
            .catch(err => {
                const error = new Error(err);
                return next(error);
            });
        if (!student) {
            const error = new Error('Student not found');
            return next(error);
        }
        const answers = req.body.answers;
        for (i = 0; i < answers.length; i++) {
            const question = await Question.findById(answers[i].question)
                .catch(err => {
                    const error = new Error(err);
                    return next(error);
                });
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
        await student.save()
            .catch(err => {
                const error = new Error(err);
                return next(error);
            });
        res.status(200).json({
            message: 'Answers checked'
        })
    });
};