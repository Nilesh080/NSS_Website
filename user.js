const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const path = require("path")
const collection = require("./mongodb")
const _ = require("lodash");

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/EjsChallenge', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Define user schema
// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ['user', 'admin'], default: 'user' },
// });

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { minimize: false, collection: "users" }
);

const User = new mongoose.model('User', userSchema);
// const colection=new mongoose.model("LogInCollection",userSchema)
module.exports=User

// Set up middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Define routes

app.get("/",function(req , res){
    res.render("userLogin")
  })

  app.get("/UserSignup",function(req,res){
    res.render("userSignup")
  })  

app.post('/userSignup', async (req, res) => {
    const { email, password, role } = req.body
    console.log(req.body , req.params , req.query)

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
  }

  const newUser = new User({
    email,
    password,
    role,
  });

  // Save user to database
  await newUser.save();

  // Generate JWT token
  const token = jwt.sign({ email, role }, 'secret');

  // Return token
  res.json({ token });
});

app.post('/userLogin', async (req, res) => {
    const { email, password } = req.body;
  
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  
    // Check if password is correct
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  
    // Generate JWT token
    const token = jwt.sign({ email, role: user.role }, 'secret');
  
    // Return token
    res.json({ token });
  });
  
  // Set up middleware to check JWT token
  const checkAuth = (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'secret');
      req.userData = decodedToken;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
  };
  
  app.get('/dashboard', checkAuth, (req, res) => {
    if (req.userData.role === 'admin') {
      res.json({ message: 'Welcome to the admin dashboard' });
    } else {
      res.json({ message: 'Welcome to the user dashboard' });
    }
  });
  
  // Start server
  app.listen(3000, () => console.log('Server started'));
/*
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/myapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Define user schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const User = mongoose.model('User', userSchema);

// Set up middleware
app.use(bodyParser.json());

// Define routes
app.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Create new user
  const newUser = new User({
    email,
    password,
    role,
  });

  // Save user to database
  await newUser.save();

  // Generate JWT token
  const token = jwt.sign({ email, role }, 'secret');

  // Return token
  res.json({ token });
});
*/