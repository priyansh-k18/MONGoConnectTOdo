const express = require('express');
const mongoose = require('mongoose');
const { UserModel, TodoModel } = require('./db');
const jwt = require('jsonwebtoken');
const { auth } = require('./auth');
const bcrypt = require('bcrypt');
require('dotenv').config();

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'ilovemongo';

async function main() {
  //
  await mongoose.connect(process.env.MONGODB_URI);
}

main().catch(err => console.log(err));

const app = express();
app.use(express.json());

app.post('/signup', async function (req, res) {
  const { email, password, name } = req.body; // Ensure password is lowercase

  console.log("Received data:", req.body); // Log the input data

  try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      await UserModel.create({ email, password: hashedPassword, name });
      
      res.json({
          message: `Welcome ${name}`,
      });
  } catch (error) {
      console.error("Error creating user:", error); // Log the error
      res.status(500).json({
          message: "Error creating user",
      });
  }
});


app.post('/signin', async function (req, res) {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/todo', auth, async function (req, res) {
  const { title, done, dueDate } = req.body;

  const dueDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})?$/;
  if (!dueDate || !dueDateFormat.test(dueDate)) {
    return res.status(400).json({ message: 'Invalid dueDate format. Please use ISO 8601 format.' });
  }

  try {
    await TodoModel.create({
      userId: req.userId,
      title,
      done: done === 'true' || done === true,
      dueDate: new Date(dueDate),
    });

    res.status(201).json({ message: "Todo created" });
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo', error });
  }
});

app.post('/todos', auth, async function (req, res) {
  try {
    const todos = await TodoModel.find({ userId: req.userId });
    res.json({ todos });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving todos', error });
  }
});

app.listen(8080, () => {
  console.log('Connected on port 8080');
});
