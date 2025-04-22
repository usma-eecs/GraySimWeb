const mongoose = require("mongoose");

// Define a User schema with Mongoose
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  acc_type: { type: String, default: "cadet", required: true }
});
const User = mongoose.model('User', userSchema);

// Define a Save schema with Mongoose

const saveSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemID: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: false }, // sometimes not used
    simulation: { type: String, required: true }, // e.g., "cpu_scheduling"
    timestamp: { type: Date, default: Date.now, required: true },
    policy: { type: String, required: true },     // e.g., "FIFO"
    event: { type: String, required: true },      // e.g., "get_feedback"
    studentAnswer: { type: String, required: true },
    feedback: { type: String, default: "None", required: true },
    isCorrect: { type: Boolean, required: true }
});



// Define a Problem schema with Mongoose
const problemSchema = new mongoose.Schema({
    simulation: { type: String, required: true },
    answer: { type: String, required: true },
    
});
const Problem = mongoose.model('Problem', problemSchema);

const testSchema = new mongoose.Schema({
  rawString: { type: String, required: true, unique: true },
  timestamp: { type: Date, required: true }
});
const Test = mongoose.model('Test', testSchema);


module.exports = { User, Save, Problem, Test };