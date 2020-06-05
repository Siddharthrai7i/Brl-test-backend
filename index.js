const express = require('express');
const app = express();
const multer =require('multer');
const AWS =require('aws-sdk');
const uuidv4  =require('uuid/v4');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoute = require('./routes/auth');
const questionRoute=require('./routes/question');

dotenv.config();
const PORT =process.env.PORT || 3000;

const s3 = new AWS.S3({
  accessKeyId:process.env.AWS_ID,
  secretAccessKey:process.env.AWS_SECRET

})

const storage = multer.memoryStorage({
  destination:function(req,file,callback){
    callback(null,'')
  }
})

const upload = multer({storage}).single('image')

app.post('/upload',upload,(req,res)=>{
 let myFile = req.file.originalname.split(".")
 const fileType=myFile[myFile.length - 1] 

  console.log(req.file)
  // res.send({
  // message:"Hello World"
    
  // })
  const params ={
    Bucket:process.env.AWS_BUCKET_NAME,
    Key:`${uuidv4()}.${fileType}`,
    Body: req.file.buffer
  }
  s3.upload(params,(error,data)=>{
     if(error){
       res.status(500).send(error)
     }
     res.status(200).send(data);
  })
})


// Connect to Mongo
mongoose.connect(process.env.DB_CONNECT, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true
}).then(() => console.log("MongoDB Connected..")).catch(err => console.log(err));

app.get('/',(req,res)=>{
  res.status(200).json({
    message:"Handling GET request",
  });
})





//middleware
app.use(express.json());




//middleware
app.use(authRoute);
app.use(questionRoute)
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
})