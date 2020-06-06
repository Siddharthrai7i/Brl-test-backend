const User = require('../model/User');
const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const schema = Joi.object({
    name:Joi.string().required(),
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
    
   //Hash password
   const salt = await bcrypt.genSalt(10);
   const { name, rollNumber, email, branch, password } = req.body;
   const hashedPassword = await bcrypt.hash(password ,salt);
   
    user = new User({
        
        name: name,
        rollNumber:rollNumber,
        email: email,
        branch:branch,
        password: hashedPassword
    })

    await user.save()

    res.json({user})

    // jwt.sign(payload, process.env.TOKEN_SECRET, (err, token) => {
    //     if (err)
    //         res.json({err})
    //     res.json({user})
    // })

    // .then(user =>{
    //     if(user){
    //         res.send({
    //             user:user._id,
    //             message:'User registered'
    //         });
    //     }
    // }).catch( err => {
    //     res.status(400).json({err});
    // })
};
