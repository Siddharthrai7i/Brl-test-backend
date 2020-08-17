const jwt = require("jsonwebtoken");
const User = require("../model/User");

const checkToken = (req) => {
  const header = req.headers["authorization"];
  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    return { success: true, token: bearer[1] };
  } else {
    return { success: false };
  }
};

exports.loginStudent = (req, res) => {
  const { rollNumber, password } = req.body;
  User.findOne({ rollNumber }).then((user) => {
    if (user) {
      if (!user.isLoggedIn) {
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
                  minutes: 30,
                  seconds: 00,
                },
              });
            }
          );
        } else {
          res.status(401).json({ error: "Password Incorrect" });
        }
      } else {
        res.status(400).json({
          error: "User Already Logged In",
        });
      }
    } else {
      res.status(400).json({ error: "No User Exist" });
    }
  });
};

exports.authStudent = async (req, res, next) => {
  var result = await checkToken(req);
  if (result.success === true && result.token != undefined) {
    try {
      const decoded = await jwt.verify(result.token, process.env.TOKEN_SECRET);
      if (decoded.user) {
        req.user = decoded.user;
        next();
      } else {
        return res
          .status(401)
          .json({ success: false, msg: "Token Is Not Valid" });
      }
    } catch (ex) {
      return res
        .status(403)
        .json({ success: false, msg: "Token Is Not Valid" });
    }
  } else {
    return res.status(403).json({ success: false, msg: "Token Is Not Valid" });
  }
};

exports.checkStartTime = (req, res, next) => {
  if (Date.now() >= ((process.env.TESTENDTIME * 1) - 1800000)) {// end time - 30 minutes i.e 4:00 PM IST of 18 Aug
    next();
  } else {
    res.status(400).json({
      message: "Test Not Yet Started",
    });
  }
};

exports.checkEndTime = (req, res, next) => {
  if (Date.now() <= process.env.TESTENDTIME * 1) { //end time i.e 4:30 PM IST of 18 Aug 
    next();
  } else {
    res.status(400).json({
      message: "Test has Ended",
    });
  }
};

exports.remainingTime = (req,res,next) => {
  // var testEndTime = Date.UTC(2020,07,18,11,10);
  var testStartTime = Date.now();
  var remainingTime = (new Date(process.env.TESTENDTIME*1).getMinutes()) - (new Date(testStartTime).getMinutes())
  if (remainingTime < 0) {
    remainingTime = 0;
  }
  req.remainingTime = remainingTime
  next();
}
