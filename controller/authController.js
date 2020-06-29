const jwt = require("jsonwebtoken");
const User = require("../model/User");

const checkToken = (req, res, next) => {
  const token = req.headers["x-auth-token"];
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
      user.comparePassword(password, function (err, isMatch) {
        if (isMatch && !err) {
          jwt.sign(
            { user: { id: user.id } },
            process.env.TOKEN_SECRET,
            { expiresIn: "8h" },
            (err, token) => {
              res.json({ token, user });
            }
          );
        } else {
          res.status(401).json({ error: "Invalid Password" });
        }
      });
    } else {
      res.status(400).json({ error: "Invalid User" });
    }
  });
};

exports.authStudent = (req, res, next) => {
  checkToken(req, res, next);
};
