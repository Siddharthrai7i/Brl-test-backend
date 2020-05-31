const express =require("express");
const app = express.Router();

const User =require('../model/User');

// finding users by id
app.get('/:id',async (req,res)=>{
  const id = req.params.id;
   try{
     const user = await User.findById(id);
     res.send(user);
   }catch(error){
  console.log(error.message);   
   }
  });
// getting all users
  app.get('/',async(req,res)=>{
    try{
      const results = await User.find();
      res.send(results);

    }catch(error){
     console.log(error.message);
    }
  });

  app.delete('/:id',async (req,res)=>{
    const id = req.params.id;
    try{
      const user = await User.findOneAndDelete(id);
      res.send(user);
    }catch(error){
   console.log(error.message);   
    }
  });
  

module.exports =app;
