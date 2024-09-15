const express = require('express');
const mongoose = require('mongoose');
const { UserModel, TodoModel } = require('./db');
const jwt = require('jsonwebtoken');
const {auth} = require('./auth');

const JWT_SECRET = 'ilovemongo';

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/clutch_todo');
}

const app = express();
app.use(express.json());

app.post('/signup', async function (req, res) {
  const { email, password, name } = req.body;

  // You should ideally hash the password here
  await UserModel.create({ email, password, name });

  res.json({
    message: `Welcome ${name}`,
  });
});

app.post('/signin', async function (req, res) {
  const { email, password } = req.body;

  // Await the result of the query
  const response = await UserModel.findOne({ email, password });

  if (response) {
    // Generate a JWT token
    const token = jwt.sign({ id: response._id.toString() }, JWT_SECRET);

    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: 'Incorrect credentials',
    });
  }
});

app.post('/todo',auth, async function(req,res){
     
     const title = req.body.title;
     const done = req.body.done;

     await TodoModel.create({
        userId: req.userId,
        title,
        done,
     });
     res.json({
        message:"Todo created",
     });
});

app.post('/todos',auth,async function(req,res){
       const userId = req.userId;
       const todos = await TodoModel.find({
         userId: req.userId,
       })
       res.json({
        todos
       });
});

app.listen(8080, () => {
  console.log('Connected on port 8080');
});
