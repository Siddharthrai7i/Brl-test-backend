const router=require('express').Router();
const User =require('../model/User');

//validation
//const Joi =require('@hapi/joi');


  // const schema =Joi.object({
    //name:Joi.string().required(),
    //email:Joi.string().min(6).required().email(),
    //password:Joi.string().min(5).required()
  //}); 


router.post('/register',async (req,res)=>{
  const user=new User({
    name:req.body.name,
    email:req.body.email,
    password:req.body.password
  });
  try{
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err){
    res.status(400).send(err);
  }

});








module.exports =router;