const router = require('express').Router();
const authregister = require('../controller/authregister')
// const authlogin = require('../controller/authlogin')
const User = require('../model/User')
const Joi = require('@hapi/joi')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')


const auth = require('../middleware/auth')

const login_schema = Joi.object({
    rollNumber: Joi.number().required(),  
    password:Joi.string().min(5).required()
});


router.post('/register', authregister.register);

// @route   POST /login
// @desc    Login user and return jwt and user object
// @access  Public
router.post('/login', async (req, res) => {

    const {error} = login_schema.validate(req.body);
    if(error) {
        const err = error.details[0].message
        return res.status(400).json({err});
    }
  
    const user = await User.findOne({rollNumber:req.body.rollNumber});
    if(!user) return res.status(400).json({error: 'Wrong roll number'});
  
    const validPass = await bcrypt.compare(req.body.password, user.password)
    if(!validPass) return res.status(400).json({errors: [{msg: 'Invalid Credential'}]})
    
    const payload = {
        user: {
            id: user.id
        }
    }
  
    jwt.sign(payload, process.env.TOKEN_SECRET, {expiresIn: 120}, (err, token) => {
        if (err) throw err;
        res.json({token, user})
    })
});



module.exports = router;