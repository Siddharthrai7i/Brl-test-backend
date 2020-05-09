const User = require('../model/User');
const Joi =require('@hapi/joi');

const schema =Joi.object({
  
    rollNo:  Joi.number().required(),  
    password:Joi.string().min(5).required()
});


module.exports.login = async (req, res) => {

   const {error} = schema.validate(req.body);
   if(error) return res.status(400).send(error.details[0].message);

   const rollNo =await User.findOne({rollNo:req.body.rollNo});
   if(!rollNo) return res.status(400).send('Invalid roll No');

   res.send('logged in!');
    
}
 