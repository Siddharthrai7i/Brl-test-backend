const router = require('express').Router();
const User = require('../model/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')

// const auth = require('../middleware/auth')



// @route   POST /register
// @desc    Register user and return user object
// @access  Public
router.post('/register',[
    check('name', 'Name is required').isString().exists(),
    check('phoneNumber', 'Phone Number is required').isString().exists(),
    check('rollNumber', 'roll number is required').isNumeric().exists(),
    check('email', 'email is required').isEmail().exists(),
    check('branch', 'branch is required').isString().exists(),
    check('password', 'password of min length 5 required').isLength({min: 5}).exists()
], async (req, res) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(401).json({errors: errors.array()})
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
});



// @route   POST /login
// @desc    Login user and return jwt and user object
// @access  Public
router.post('/login',[
        check('rollNumber', 'Please include a valid Roll Number').isNumeric().exists(),
        check('password', 'Invalid Credentials').exists()
    ], async (req, res) => {

    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(401).json({errors: errors.array()})
    }

    const {rollNumber, password} = req.body

    const user = await User.findOne({rollNumber});
    if(!user) return res.status(400).json({error: 'Invalid Credentials'});

    const validPass = await bcrypt.compare(password, user.password)
    if(!validPass) return res.status(401).json({errors: [{msg: 'Invalid Credentials'}]})

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