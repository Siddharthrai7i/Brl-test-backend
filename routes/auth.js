const router = require('express').Router();
const authregister = require('../controller/authregister')
const User = require('../model/User')
// const Joi = require('@hapi/joi')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')

const auth = require('../middleware/auth')


// @route   POST /register
// @desc    Register user and return user object
// @access  Public
router.post('/register', authregister.register);



// @route   POST /login
// @desc    Login user and return jwt and user object
// @access  Public
router.post('/login',[
        check('rollNumber', 'Please include a valid Roll Number').isNumeric().exists(),
        check('password', 'Password of minimum length 5 is required').isLength({min: 5}).exists()
    ], async (req, res) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(401).json({errors: errors.array()})
    }

    const {rollNumber, password} = req.body
  
    const user = await User.findOne({rollNumber});
    if(!user) return res.status(400).json({error: 'Wrong roll number'});
  
    const validPass = await bcrypt.compare(password, user.password)
    if(!validPass) return res.status(401).json({errors: [{msg: 'Invalid Credential'}]})
    
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