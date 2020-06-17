const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email:{
    type:String,
    unique: true,
    required:true,
    max:255
  },
  password:{
    type:String,
    required:true,
    max:1024,
    min:6
  },
  rollNumber:{
    type:String,
    required:true,
    max:13,
    unique: true
  },
  branch:{
    type:String,
  },
  date:{
    type:Date,
    default:Date.now
  },
  questions: [
    {
      type: String
    }
  ]
});

module.exports = User = mongoose.model('User',userSchema);