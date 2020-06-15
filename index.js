const express = require('express');
const app = express();

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoute = require('./routes/auth');
const questionRoute = require('./routes/question');
const adminRoute =require('./routes/admin');
const cors = require('cors')

dotenv.config();
const PORT =process.env.PORT || 3000;


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

//Cors Policy
app.use(cors({
    origin: "*"
}));

//middleware
app.use(authRoute);
app.use(questionRoute)


app.use('/admin',adminRoute)
app.use((req, res) => {
  res.status(404).send('404 Not Found')
})

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Express server listening on port ${server.address().port} in ${app.settings.env} mode`);
})
