const router = require('express').Router();
const authregister = require('../controller/authregister')
const authlogin= require('../controller/authlogin')
//validation
//const Joi =require('@hapi/joi');


// const schema =Joi.object({
//name:Joi.string().required(),
//email:Joi.string().min(6).required().email(),
//password:Joi.string().min(5).required()
//}); 


router.post('/register', authregister.register);
router.post('/login', authlogin.login);

module.exports = router;