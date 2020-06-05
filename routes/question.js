const express = require('express');

const questionController = require('../controller/questions');

const router = express.Router();

router.post('/add-question', questionController.postQuestions);
router.get('/get-questions', questionController.getQuestions);
router.post('/check-answers', questionController.postCheckAnswers);

module.exports = router;