const router = require('express').Router();
const authController = require('../controller/authController')

//validation
//const Joi =require('@hapi/joi');


// const schema =Joi.object({
//name:Joi.string().required(),
//email:Joi.string().min(6).required().email(),
//password:Joi.string().min(5).required()
//}); 


router.post('/register', authController.register);





module.exports = router;