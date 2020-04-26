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
  res.send("hello users");
})
//middleware
app.use(express.json());




//middleware
app.use('/api/user', authRoute);

app.listen(PORT, () => console.log('server up and running'));