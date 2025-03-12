// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { spawn } = require("child_process");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Save, Problem, Test } = require('./schemas');


// Create an Express app
const app = express();

// Middleware: Parse JSON bodies from HTTP requests
app.use(express.json());
app.use(cors());

let scalaServerProcess = null;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cadets')
  .then(() => console.log('MongoDB is connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// **Register Route**: Create a new user
app.post('/register', async (req, res) => {
  try {
    // Step 1: Extract email, password, and acc_type from the request body
    const { email, password, acc_type } = req.body;

    console.log("Email:", email);
    console.log("Password: ", password);

    // Step 2: Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Account already exists!' });
    }

    // Step 3: Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 4: Create a new user with the hashed password
    const user = new User({ email, password: hashedPassword, acc_type });
    await user.save();

    // Step 5: Create a JWT (JSON Web Token) so the user can be authenticated in future requests
    const payload = { userId: user._id };
    const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' });

    // Step 6: Respond with the token
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// **Login Route**: Authenticate an existing user
app.post('/login', async (req, res) => {
  try {
    // Step 1: Extract email and password from the request body
    const { email, password } = req.body;

    // Step 2: Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials!' });
    }

    // Step 3: Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials!' });
    }

    // Step 4: Create a JWT for the user
    const payload = { userId: user._id };
    const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' });

    // Step 5: Respond with the token
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// **Test Route**: Verify backend communication
app.post('/test', async (req, res) => {
  try {
    const { rawString } = req.body; // Extract rawString from the request body

    // Check if the string already exists in the database
    const existingString = await Test.findOne({ rawString });
    if (existingString) {
      const responseMessage = { msg: 'String already saved!' };
      return res.status(400).json(responseMessage);
    }

    // Create a new Test entry
    const test_save = new Test({ rawString, timestamp: Date.now() });
    await test_save.save();

    // Create response message
    const responseMessage = { msg: "Successfully saved!" };

    // ✅ Send response to the frontend
    return res.status(200).json(responseMessage); // ✅ Correctly sends JSON response

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" }); // ✅ Consistent error response
  }
});

// Start Scala Server when user logs in
app.post("/start-scala", (req, res) => {
  if (scalaServerProcess) {
    return res.json({ msg: "Scala server is already running!" });
  }

  scalaServerProcess = spawn("sbt", ["run"], { cwd: "backend/scala-app" });

  scalaServerProcess.stdout.on("data", (data) => {
    console.log(`[SCALA OUT]: ${data}`);
  });

  scalaServerProcess.stderr.on("data", (data) => {
    console.error(`[SCALA ERR]: ${data}`);
  });

  scalaServerProcess.on("close", () => {
    console.log("Scala server stopped.");
    scalaServerProcess = null;
  });

  res.json({ msg: "Scala server started!" });
});

// Stop Scala Server when user logs out
app.post("/stop-scala", (req, res) => {
  if (scalaServerProcess) {
    scalaServerProcess.kill();
    scalaServerProcess = null;
    res.json({ msg: "Scala server stopped!" });
  } else {
    res.json({ msg: "Scala server is not running." });
  }
});

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
