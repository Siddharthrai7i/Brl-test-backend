var request_count = {};

const rateLimitProps = { max_req: 15, refresh_time: 1 * 60 * 1000 };
var last_reset = new Date();

// exports.rateLimiter = (req, res, next) => {
//   try {
//     const id = req.user.id;
//     const now = new Date();
//     if (now - last_reset >= rateLimitProps.refresh_time) {
//       request_count = {};
//       last_reset = new Date();
//     }
//     request_count[id] = request_count[id] ? request_count[id] + 1 : 1;
//     if (request_count[id] > rateLimitProps.max_req) {
//       return res
//         .status(502)
//         .json({error: "Server Unavailable! Please try again after few minutes"});
//     }
//     next();
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(502)
//       .json({error: "Server Unavailable! Please try again after few minutes"});
//   }
// };



exports.rateLimiter = (req, res, next) => {
  try {
    // Use the IP address of the client as the unique identifier
    const ip = req.ip;
    const now = new Date();

    // Reset the request count after the refresh time
    if (now - last_reset >= rateLimitProps.refresh_time) {
      request_count = {};
      last_reset = new Date();
    }

    // Increment the request count for this IP address
    request_count[ip] = request_count[ip] ? request_count[ip] + 1 : 1;

    // Check if the request count exceeds the maximum allowed requests
    if (request_count[ip] > rateLimitProps.max_req) {
      return res.status(429).json({
        error: "Too Many Requests! Please try again after a few minutes."
      });
    }

    // Proceed to the next middleware if the rate limit is not exceeded
    next();
  } catch (err) {
    console.error(err);
    return res.status(502).json({
      error: "Server Unavailable! Please try again after a few minutes."
    });
  }
};
