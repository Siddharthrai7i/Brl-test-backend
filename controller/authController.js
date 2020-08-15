const jwt = require("jsonwebtoken");
const User = require("../model/User");

const checkToken = (req, res, next) => {
  let bearertoken = req.headers['authorization']
  const token = bearertoken.replace('Bearer ', '')
  if (typeof token !== "undefined") {
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      req.user = decoded.user;
      next();
    } catch (err) {
      console.log(err);
      res.status(401).json({ msg: "Token is not valid" });
    }
  } else {
    res.status(401).json({ msg: "No token, authorization denied" });
  }
};

exports.loginStudent = (req, res) => {
  const { rollNumber, password } = req.body;
  User.findOne({ rollNumber }).then((user) => {
      if (user) {
        if (!user.isLoggedIn){
          if (user.password === password) {
            jwt.sign(
              { user: { id: user.id } },
              process.env.TOKEN_SECRET,
              { expiresIn: "1h" },
              async (err, token) => {
                user.isLoggedIn = true;
                await user.save();
                res.json({ 
                  token: token,
                  timer: {
                    hours: 00,
                    minutes: 50,
                    seconds: 00
                  }
                });
              }
            );
          } else {
            res.status(401).json({ error: "Invalid Password" });
          }
        } else {
          res.status(400).json({
            error: 'User already Logged In'
          });
        }
    } else {
      res.status(400).json({ error: "Invalid User" });
    }
  })
};

exports.authStudent = (req, res, next) => {
  checkToken(req, res, next);
};

exports.checkStartTime = (req,res,next) => {
  if(Date.now() >= Date.UTC(2020,07,18,08,30)) {
    next();
  } else {
    res.status(400).json({
      message: "Test Has not Been Started"
    });
  }

}

exports.checkEndTime = (req,res,next) => {
  if (Date.now() <= Date.UTC(2020,07,18,09,10)){
    next();
  } else {
    res.status(400).json({
      message: "Test has Ended"
    });
  }
}
