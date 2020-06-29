const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");

const router = require("express").Router();
dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const upload = multer({ storage }).single("image");

router.post("/upload", upload, (req, res) => {
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  console.log(req.file);
  // res.send({
  // message:"Hello World"
  console.log(uuidv4());
  // })
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${Date.now}.${fileType}`,
    Body: req.file.buffer,
  };
  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    }
    res.status(200).send(data);
  });
});

module.exports = router;
