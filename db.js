
const mongoose = require('mongoose');


const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Basic email regex pattern
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: true,
    // validate: {
    //   validator: function (v) {
    //     return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
    //   },
    //   message: props => 'Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.'
    // }
  },
  name: { type: String, required: true }
});

const Todo = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    title: {
      type: String,
      required:true
    },
    done: {
       type:Boolean,
       default:false
    },
    dueDate:{
      type:Date,
      required:true
    }
    
  },{timestamps:true});
  

const UserModel = mongoose.model('users',User);
const TodoModel = mongoose.model('todos',Todo);

module.exports = {
    UserModel,
    TodoModel
}