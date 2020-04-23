const User = require('../model/User');
const Joi =require('@hapi/joi');

const schema =Joi.object({
    name:Joi.string().required(),
    
    email: Joi.string().email().required(),

    password:Joi.string().min(5).required()
});


module.exports.register = async (req, res) => {

   const {error} = schema.validate(req.body);
   if(error) return res.status(400).send(error.details[0].message);

   const emailExist =await User.findOne({email:req.body.email});
   if(emailExist) return res.status(400).send('email already exists');
    const { name, email, password } = req.body;
    new User({
        name: name,
        email: email,
        password: password
    }).save().then(user =>{
        if(user){
            res.send(user);
        }
    }).catch( err =>{
        res.status(400).send(err);
    })
}