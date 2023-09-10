const jwt = require("jsonwebtoken");
const User = require("../model/User");
const Test = require("../model/Time");
const axios = require("axios");
require("dotenv").config();

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
  const { rollNumber, password, recaptcha } = req.body;
  axios({
    url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET}&response=${recaptcha}`,
    method: "POST",
  }).then((data) => {
    console.log(data);
    if (data.success) {
      console.log("success: true")
      User.findOne({ rollNumber })
        .then((user) => {
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
                      time: {
                        hours: 00,
                        minutes: 60,
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
            res.status(400).json({ error: "You are not a Human" });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(400).json({ error: "Something went wrong" });
        });
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

exports.checkTime = (req, res, next) => {
  try {
    Test.findOne({ title: "BRL Recruitment Test" }, function (err, result) {
      var time = new Date();
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      } else {
        if (time > result.startTime) {
          if (time < result.endTime) {
            const remainingTime = result.endTime - time;
            const minutes = Math.max(0, Math.floor(remainingTime / 60000));
            const seconds = Math.max(
              0,
              Math.floor((remainingTime % 60000) / 1000)
            );
            req.time = {
              minutes: minutes,
              seconds: seconds,
            };
            next();
          } else {
            res.status(500).json({
              message: "Test has Ended",
            });
          }
        } else {
          message = "Test Not Yet Started";
          var time_to_start = result.startTime - time;
          const minutes = Math.floor(time_to_start / 60000);
          const seconds = Math.floor((time_to_start % 60000) / 1000);
          res.status(500).json({
            message: message,
            minutes: minutes,
            seconds: seconds,
          });
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
