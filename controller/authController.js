const User = require('../model/User');

module.exports.register = async (req, res) => {
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