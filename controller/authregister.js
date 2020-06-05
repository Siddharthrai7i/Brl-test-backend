const User = require('../model/User');
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');

const schema = Joi.object({
    name:Joi.string().required(),
    rollNumber: Joi.number().required(),  
    email: Joi.string().email().required(),
    branch: Joi.string().required(),
    password:Joi.string().min(5).required()
});


exports.register = async (req, res) => {

   const {error} = schema.validate(req.body);
   if(error) return res.status(400).send(error.details[0].message);

   const emailExist = await User.findOne({email:req.body.email});
   if(emailExist) return res.status(400).send('email already exists');
    
   //Hash password
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(req.body.password,salt);
   const { name, rollNumber, email, branch, password } = req.body;
   
    new User({
        name: name,
        rollNumber:rollNumber,
        email: email,
        branch:branch,
        password: hashedPassword
    }).save().then(user =>{
        if(user){
            res.send({user:user._id,
            message:'User registered'});
        }
    }).catch( err => {
        res.status(400).send(err);
    })
};
