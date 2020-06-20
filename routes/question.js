const express = require('express');
const User = require('../model/User');
const Question = require('../model/Question');
const auth = require('../middleware/auth')

const questionController = require('../controller/questions');

const router = express.Router();

router.post('/check-answers', questionController.postCheckAnswers);



// @route   POST /add-question
// @desc    Add questions to database
// @access  Public
router.post('/add-question', async (req, res) => {
    const {question, one, two, three, four, correct} = req.body;
    

    try {
        const new_question = new Question({
            question,
            one,
            two,
            three,
            four,
            correct
        })

        await new_question.save()

        return res.status(200).json({msg: "Question Saved"})
    } catch (err) {
        if(err) {
            res.status(500).json({error: 'Server Error'})
        }
    }
})



// @route   POST /get-questions
// @desc    Get 10 random questions
// @access  Private
router.get('/get-questions', auth, async (req, res, next) => {
    
    const user = await User.findById(req.user.id)
    const all_questions = await Question.find();

    // get total number of docs
    const total_docs = all_questions.length

    nos_list = []
    for (let i = 0; i <total_docs; i++) 
        nos_list.push(i)


    random_list = []
    for (let i = 0; i < 10; i ++) {
        let s1 = nos_list.length
        let s2 = Math.random() * s1
        let res = Math.floor(s2)
        

        let randomNumber = nos_list[res]
        nos_list.splice(res, 1)
        random_list.push(randomNumber)
    }
    /////////////////////////

    res_questions = []
    temp_questions_arr = []

    for (let i = 0; i < random_list.length; i++) {
        temp_questions_arr.push(all_questions[random_list[i]]._id)

        
        const {_id, question, one, two, three, four} = all_questions[random_list[i]]
        question_object = {
            _id,
            question,
            options: [one, two, three, four]
        }

        res_questions.push(question_object)
    }
    
    user.questions = temp_questions_arr
    user.save()
    
    return res.status(200).json({res_questions})
    
});


module.exports = router;
