const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const collection = require("./mongodb")
const path = require("path")


// app.set("view engine","ejs")


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const app = express();
app.use(express.json())

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

let posts = []; 
// add below
app.use(express.urlencoded({extended:false}))

app.get("/",function(req , res){
  res.render("login")
})

app.get("/signup",function(req,res){
  res.render("signup")
})

app.post("/signup", async (req,res)=>{
  const data={
    email:req.body.email,
    password:req.body.password,
    role:req.body.role
  }
  await collection.insertMany([data])
  const references = {startingContent:homeStartingContent ,
    posts:posts,
    role:data.role}
  res.render("home" , references);
})

app.post("/login", async (req,res)=>{
  
  try{
    const check=await collection.findOne({email:req.body.email})
    if(check.password === req.body.password){
      console.log(check)
      const references = {startingContent:homeStartingContent ,
        posts:posts,
        role:check.role}
      res.render("home" ,references);
    }
    else{
      res.send("Wrong password")
    }
   
  }
  catch{
    res.send("wrong details")
  }
  
  
})
//add above

// app.get("/" , function(req , res){
//   res.render("home" , {startingContent:homeStartingContent ,
//                       posts:posts});
  
// }); 

app.get("/about" , function(req,res){
  res.render("about" , {aboutContent:aboutContent});
});



app.get("/contact" ,function(req , res){
  
res.render("contact" , {contactContent:contactContent});
  
});

app.get("/compose" , function(req , res){
  res.render("compose");
})
app.post("/compose" , function(req ,res){
  const post = {
    title:req.body.postTitle,
    date:req.body.postDate,
    start:req.body.postTimeStart,
    end:req.body.postTimeEnd,
    content:req.body.postBody
  }; 
  posts.push(post);
  res.render("home" , {startingContent:homeStartingContent ,
    posts:posts});
})

app.get("/posts/:postName", function(req , res){
  const requiredTitle = _.lowerCase(req.params.postName);
  posts.forEach(function(post){
    const storedTitle = _.lowerCase(post.title);
    if(requiredTitle === storedTitle){
      res.render("post" , {
        title:post.title, 
        date:post.date,
        start:post.start,
        end:post.end,
        content:post.content
        
      })
    } 
  })
})



app.listen(3000, function() {
  console.log("Server started on port 3000 and Port connected");
});

/*
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define user schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

// Define user model
const User = mongoose.model('User', userSchema);

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define signup route
app.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    // Create user
    const user = await User.create({ username, password: hashedPassword, role });
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Define login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    // Generate JWT token
    const token = jwt.sign({ username: user.username, role: user.role }, 'secret');
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Define admin route
app.get('/admin', (req, res) => {
  // Check JWT token for admin role
  const token = req.headers.authorization.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.status(200).json({ message: 'Welcome, admin!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start server
app.listen(port, () => console.log(`Server listening on port ${port}`));
 */