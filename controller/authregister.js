const User = require('../model/User');
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const schema = Joi.object({
    name:Joi.string().required(),
    phoneNumber:Joi.string().required(),
    rollNumber: Joi.number().required(),  
    email: Joi.string().email().required(),
    branch: Joi.string().required(),
    password:Joi.string().min(5).required()
});

exports.register = async (req, res) => {

   const {error} = schema.validate(req.body);
   if(error) {
       err = error.details[0].message
       return res.status(400).json({err});
   } 

   const emailExist = await User.findOne({email:req.body.email});
   if(emailExist) return res.status(400).json({error: 'email already exists'});

   const rollNumberExists = await User.findOne({rollNumber: req.body.rollNumber})
   if (rollNumberExists) return res.status(400).json({error: 'roll number already exists'})
    
   //Hash password
   const { name, rollNumber, email, branch, password, phoneNumber } = req.body;

   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password ,salt);
   
    user = new User({
        name,
        rollNumber,
        phoneNumber,
        email,
        branch,
        password: hashedPassword
    })

    await user.save()

    res.status(200).json({user})
};
