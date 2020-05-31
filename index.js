 const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoute = require('./routes/auth');
const userRoute =require('./routes/User');
const questionRoute=require('./routes/question');

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





//middleware
app.use(express.json());




//middleware
app.use('/api/user', authRoute);
app.use('/User',userRoute);
app.use('/Question',questionRoute)
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
})