const User = require('../model/User');
const Joi =require('@hapi/joi');
const jwt =require('jsonwebtoken');
const bcrypt =require('bcryptjs');

const schema =Joi.object({
  
    rollNumber:  Joi.number().required(),  
    password:Joi.string().min(5).required()
});


module.exports.login = async (req, res) => {

   const {error} = schema.validate(req.body);
   if(error) return res.status(400).send(error.details[0].message);

   const user =await User.findOne({rollNumber:req.body.rollNumber});
   if(!user) return res.status(400).send('Invalid roll No');

   const validPass = await bcrypt.compare(req.body.password,user.password)
  
   if(!validPass) return res.status(400).send('Invalid password') 
  
  const token =jwt.sign({ _id: user._id},process.env.TOKEN_SECRET)
  res.header('auth-token',token).send(token);
}
 