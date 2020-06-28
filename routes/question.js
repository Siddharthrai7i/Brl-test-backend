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
    
    // If user already has the questions
    if (user.questions.length === 10) {
        return res.redirect('/return-questions')
    }


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


// @route   POST /return-questions
// @desc    Get 10 random questions
// @access  Private
router.get('/return-questions',auth, async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res_questions = []

    //////////////////////////
    var question_ob = await Question.findById(user.questions[0]);
    var {_id, question, one, two, three, four} = question_ob
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)

    //////////////////////////
    var question_ob_1 = await Question.findById(user.questions[1]);
    var {_id, question, one, two, three, four} = question_ob_1
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)

    //////////////////////////
    var question_ob_2 = await Question.findById(user.questions[2]);
    var {_id, question, one, two, three, four} = question_ob_2
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)

    //////////////////////////
    var question_ob_3 = await Question.findById(user.questions[3]);
    var {_id, question, one, two, three, four} = question_ob_3
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)

    //////////////////////////
    var question_ob_4 = await Question.findById(user.questions[4]);
    var {_id, question, one, two, three, four} = question_ob_4
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)

    //////////////////////////
    var question_ob_5 = await Question.findById(user.questions[5]);
    var {_id, question, one, two, three, four} = question_ob_5
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)

    //////////////////////////
    var question_ob_6 = await Question.findById(user.questions[6]);
    var {_id, question, one, two, three, four} = question_ob_6
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)

    //////////////////////////
    var question_ob_7 = await Question.findById(user.questions[7]);
    var {_id, question, one, two, three, four} = question_ob_7
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)

    //////////////////////////
    var question_ob_8 = await Question.findById(user.questions[8]);
    var {_id, question, one, two, three, four} = question_ob_8
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)

    //////////////////////////
    var question_ob_9 = await Question.findById(user.questions[9]);
    var {_id, question, one, two, three, four} = question_ob_9
    question_object = {
        _id,
        question,
        options: [one, two, three, four]
    }
    res_questions.push(question_object)
    

    return res.status(200).json({res_questions})
})