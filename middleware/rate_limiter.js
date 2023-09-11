var request_count = {};

const rateLimitProps = { max_req: 15, refresh_time: 1 * 60 * 1000 };
var last_reset = new Date();

exports.rateLimiter = (req, res, next) => {
  try {
    const id = req.user.id;
    const now = new Date();
    if (now - last_reset >= rateLimitProps.refresh_time) {
      request_count = {};
      last_reset = new Date();
    }
    request_count[id] = request_count[id] ? request_count[id] + 1 : 1;
    if (request_count[id] > rateLimitProps.max_req) {
      return res
        .status(502)
        .json({error: "Server Unavailable! Please try again after few minutes"});
    }
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(502)
      .json({error: "Server Unavailable! Please try again after few minutes"});
  }
};
