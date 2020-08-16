const Feedback = require("../model/Feedback");

exports.addFeedback = async (req, res, next) => {
  try {
    const { feedback, quality, name, email } = req.body;

    const payload = new Feedback({
      quality,
      name,
      email,
      feedback,
    });

    payload.save();
    return res.status(200).json({ msg: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: "Failure" });
  }
};
