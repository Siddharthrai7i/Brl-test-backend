const express = require('express');
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

    const all_questions = await Question.find();

    temp_questions_arr = []
    for (let i = 0; i < all_questions.length; i++) {
        temp_questions_arr.push(all_questions[i]._id)
    }
    
    user.questions = temp_questions_arr
    user.save()
    
    return res.status(200).json({all_questions})
    
});


module.exports = router;
