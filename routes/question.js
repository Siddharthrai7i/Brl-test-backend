const express = require('express');
const jwt = require('jsonwebtoken')
const User = require('../model/User');
const Question = require('../model/Question');
const auth = require('../middleware/auth')

const questionController = require('../controller/questions');

const router = express.Router();

router.post('/add-question', questionController.postQuestions);
router.post('/check-answers', questionController.postCheckAnswers);



router.get('/get-questions', auth, async (req, res, next) => {
    
    const user = await User.findById(req.user.id)

    await Question.countDocuments({},(err, cnt) => {
        console.log(cnt);
    })
    const questions = await Question.find();
    return res.status(200).json({questions})


});


module.exports = router;