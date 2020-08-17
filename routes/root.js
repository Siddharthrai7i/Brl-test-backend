const router = require("express").Router();
const utilController = require("../controller/utilController");
const userController = require("../controller/userController");
const authController = require("../controller/authController");
const moment = require("moment-timezone");
const { body } = require("express-validator");

// const auth = require('../middleware/auth')

// @route   POST /register
// @desc    Register user and return user object
// @access  Public
router.post(
  "/register",
  [
    body("name", "Name is required").isString().exists(),
    body("phoneNumber", "Phone Number is required").isString().exists(),
    body("rollNumber", "roll number is required").isNumeric().exists(),
    body("email", "email is required").isEmail().exists(),
    body("branch", "branch is required").isString().exists(),
    body("password", "password of min length 5 required")
      .isLength({ min: 5 })
      .exists(),
  ],
  utilController.validateRequest,
  userController.addUser
);

// @route   POST /login
// @desc    Login user and return jwt and user object
// @access  Public
router.post(
  "/login",
  [
    body("rollNumber", "Please include a valid Roll Number")
      .isNumeric()
      .exists(),
    body("password", "Invalid Credentials").exists(),
  ],
  utilController.validateRequest,
  authController.loginStudent
);

router.get("/time", (req, res) => {
  var d = 1597678200000;
  res.status(200).json({
    success: true,
    epoch: d,
    time: new Date(d).toUTCString(),
    India: moment.unix(d / 1000).tz("Asia/Kolkata").toLocaleString(),
  });
});
module.exports = router;
