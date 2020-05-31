const express = require('express')
const router = express.Router()
const Question = require('../model/Question');

// create one quiz question
router.post('/', async (req, res) => {
  try {
      const { description } = req.body
      const { alternatives } = req.body

      const question = await Question.create({
          description,
          alternatives
      })

      return res.status(201).json(question)
  } catch (error) {
      return res.status(500).json({"error":error})
  }
})

router.get('/', async (req, res) => {
  try {
      const questions = await Question.find()
      return res.status(200).json(questions)
  } catch (error) {
      return res.status(500).json({"error":error})
  }
})


module.exports=router;