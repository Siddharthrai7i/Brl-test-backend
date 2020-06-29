const User = require("../model/User");

exports.addUser = async (req, res) => {
  const { name, rollNumber, email, branch, password, phoneNumber } = req.body;
  const emailExist = await User.findOne({ email: email });
  if (emailExist)
    return res.status(400).json({ error: "email already exists" });

  const rollNumberExists = await User.findOne({
    rollNumber: rollNumber,
  });
  if (rollNumberExists)
    return res.status(400).json({ error: "roll number already exists" });

  user = new User({
    name,
    rollNumber,
    phoneNumber,
    email,
    branch,
    password: password,
  });

  await user.save();

  res.status(200).json({ user });
};
