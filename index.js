const express=require('express')
const app=express()
const cors=require('cors');
const User=require('./models/User')
const Post=require('./models/Post')
const { default: mongoose } = require('mongoose');
const bcrypt=require('bcryptjs')
const salt=bcrypt.genSaltSync(10)
const secret='hfyt6ou9p89y7ji8i7ikk0u8tiy7'
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const multer=require('multer')
const uploadMiddleware=multer({dest:'uploads/'})
const fs=require('fs')

 app.use(cors({credentials:true,origin:'http://localhost:5173'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'))

 mongoose.connect('mongodb://localhost:27017/');

app.post('/register',async (req,res)=>{
  const {username,password}=req.body;
try {const userDoc= await User.create({username,
  password:bcrypt.hashSync(password,salt)})
  res.json(userDoc)}
  catch(e){
    
    res.status(400).json(e);
  }
})
app.post('/login',async (req,res)=>{
  const {username,password}=req.body;
  const userDoc= await User.findOne({username:username});
  const passOk=bcrypt.compareSync(password,userDoc.password);
  if(passOk){
    //logged in
    jwt.sign({
      username,id:userDoc._id
    },secret,{},(err,token)=>{
if(err) throw err;
res.cookie('token',token).json({
  id:userDoc._id,
  username,
})
    })
  }
  else{
    res.status(400).json('wrong credentials')
  }
})

app.get('/profile',(req,res)=>{
  const {token}=req.cookies;
  jwt.verify(token,secret,{},(err,info)=>{
    if(err) throw err;
    res.json(info)
  })
  
})
app.post('/logout',(req,res)=>{
  res.cookie('token','').json('ok');
})
app.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
const {originalname}=req.file;
const parts=originalname.split('.')
const ext=parts[parts.length-1]
const newPath=path+'.'+ext;
fs.renameSync(path,newPath)
const {token}=req.cookies;
jwt.verify(token,secret,{},async (err,info)=>{
  if(err) throw err;
  const {title,summary,content}=req.body;
const postDoc=await Post.create({
title,
summary,
content,
cover:newPath,
author:info.id

})
  res.json(postDoc);
})



// res.json(postDoc)
})
app.put('/post',uploadMiddleware.single('file'),async (req,res)=>{
  let newPath=null;
  if(req.file){
    const {originalname}=req.file;
const parts=originalname.split('.')
const ext=parts[parts.length-1]
const newPath=path+'.'+ext;
fs.renameSync(path,newPath)

  }
const {token}=req.cookies;
jwt.verify(token,secret,{},async (err,info)=>{
  if(err) throw err;
  const postDoc=await Post.findById(id)
  const isAuthor=JSON.stringify(postDoc.author)===JSON.stringify(info.id);
if(!isAuthor){
 return res.status(400).json('you are not the author')
   throw 'you are not the author'}

   await postDoc.updateOne({title,summary,content,cover:newPath?newPath:postDoc.cover,})
  // if(info.id===z)
//   const {title,summary,content}=req.body;
// const postDoc=await Post.create({
// title,
// summary,
// content,
// cover:newPath,
// author:info.id

// })
  res.json(postDoc);
})
  // res.json({test:4,fileIs:req.file})
})


app.get('/post',async (req,res)=>{
  const posts=await Post.find().populate('author',['username'])
    .sort({createdAt:-1})
    .limit(20);
  
  res.json(posts);
})
app.get('/post/:id',async (req,res)=>{
  const {id}=req.params;
 const postDoc= await Post.findById(id).populate('author',['username']);
  res.json(postDoc)

})
app.listen(4000)

//2:27:27