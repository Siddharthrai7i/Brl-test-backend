const User = require('../model/User');
const Joi =require('@hapi/joi');
const jwt =require('jsonwebtoken');
const bcrypt =require('bcryptjs');

const schema =Joi.object({
    rollNumber: Joi.number().required(),  
    password:Joi.string().min(5).required()
});


exports.login = async (req, res) => {

   const {error} = schema.validate(req.body);
   if(error) {
     const err = error.details[0].message
     return res.status(400).json({err});
    }

   const user = await User.findOne({rollNumber:req.body.rollNumber});
   if(!user) return res.status(400).json({error: 'Invalid Credentials'});

   const validPass = await bcrypt.compare(req.body.password,user.password)
   if(!validPass) return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]})
  
  jwt.sign({ _id: user._id}, process.env.TOKEN_SECRET, {}, (err, token) => {
    if (err) throw err;
    res.json({token, user})
  })
}
 
