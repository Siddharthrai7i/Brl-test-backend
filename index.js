const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoute = require('./routes/auth');

const PORT =process.env.PORT || 3000;
dotenv.config();

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

app.get('/userId',(req,res)=>{
const id = req.params.userId;
 res.status(200).json({
   message:"you passed an id",
 })
});

app.patch('/userId',(req,res)=>{
  res.status(200).json({
    message:"upadated user",
  })
});

app.delete('/userId',(req,res)=>{
  res.status(200).json({
    message:"user deleted",
  })
})

//middleware
app.use(express.json());




//middleware
app.use('/user', authRoute);

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
})