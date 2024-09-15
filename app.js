var createError = require("http-errors");
const express = require("express");
var path = require("path");
const app = express();
const rateLimit = require("express-rate-limit");
var logger = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const studentRoute = require("./routes/student");
const indexRoute = require("./routes/root");
const adminRoute = require("./routes/admin");
const { authStudent } = require("./controller/authController");
const questionController = require('./controller/questionController');
const cors = require("cors");

dotenv.config();
const PORT = process.env.PORT || 3000;

// const limiter = rateLimit({
// 	windowMs: 2 * 60 * 1000, // 10 minutes
// 	max: 2500, // limit each IP to 400 requests per windowMs
// });

app.set('trust proxy', 1);
// app.use(limiter);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Connect to Mongo
mongoose
  .connect(process.env.DB_CONNECT, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB Connected.."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Handling GET request",
  });
});

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger("dev"));

//Cors Policy
app.use(
  cors({
    origin: "*",
  })
);

//middleware
app.use("/", indexRoute);
app.use("/student", authStudent, studentRoute);
app.use("/admin",authStudent, adminRoute);
app.get("/getResult/:email", questionController.getResult);

app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
