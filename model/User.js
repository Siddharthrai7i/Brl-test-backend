const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    rollNumber: {
      type: String,
    },
    branch: {
      type: String,
    },
    questions: [
      {
        type: String,
      },
    ],
    responses: [
      {
        question: {
          type: String
        },
        response: {
          type: String
        },
        status: {
          type: String
        }
      }
    ],
    endResponses: [
      {
        question: {
          type: String
        },
        response: {
          type: String
        }
      }
    ]
  },
  { timestamps: true }
);


userSchema.pre("save", function (next) {
  var user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (password, next) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) {
      console.log(err);
      return next(err);
    }
    next(null, isMatch);
  });
};

module.exports = User = mongoose.model("User", userSchema);
