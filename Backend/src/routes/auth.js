const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req,res)=>{
  const {name,email,password,studentId} = req.body;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const u = new User({name,email,passwordHash,studentId});
  await u.save();

  res.status(201).json({
    message: 'ok',
    userId: u._id
   });

});

router.post('/login', async (req,res)=>{
  const {email,password} = req.body;
  const u = await User.findOne({email});
  if(!u) return res.status(401).json({msg:'invalid'});
  const ok = await bcrypt.compare(password, u.passwordHash);
  if(!ok) return res.status(401).json({msg:'invalid'});
  const token = jwt.sign({id:u._id,role:u.role}, process.env.JWT_SECRET || 'dev',{expiresIn:'7d'});
  //   res.json({token});
  res.json({
  token,
  userId: u._id,
  role: u.role
});

});

module.exports = router;
