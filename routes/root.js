const router = require("express").Router();
const utilController = require("../controller/utilController");
const userController = require("../controller/userController");
const authController = require("../controller/authController");
const { checkStartTime } = require("../controller/authController");
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

router.get("/time", checkStartTime);
module.exports = router;
