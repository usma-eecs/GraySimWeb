// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const { User, Save, Problem, Test } = require('./schemas');
const graySim = require('./test_scala_server');


// Create an Express app
const app = express();

// Middleware: Parse JSON bodies from HTTP requests
app.use(express.json());
app.use(cors());

// let scalaServerProcess = null;
const pendingVerifications = new Map(); 
// const email_validate = /^[a-zA-Z0–9._%+-]+@[a-zA-Z0–9.-]+\.[a-zA-Z]{2,}$/;
const email_validate = /^[a-zA-Z0-9._%+\-]+@westpoint\.edu$/;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/cadets')
  .then(() => console.log('MongoDB is connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// 1) SEND-VERIFY route
app.post('/send-verify', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email_validate.test(email)) {
      return res.status(400).json({ msg: 'Please use a valid @westpoint.edu email address.' });
    }

    // Check if user already exists in DB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Account already exists!' });
    }

    // If there's already a pending entry, check if it’s expired:
    const pending = pendingVerifications.get(email);
    if (pending) {
      if (Date.now() < pending.expires) {
        // Not expired yet
        return res.status(200).json({ msg: 'A valid code already exists. Check your email!' });
      } else {
        // Expired => remove it
        pendingVerifications.delete(email);
      }
    }

    // Generate a 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000)); // e.g. 250391
    console.log(code)
    // Set expiry to 5 minutes from now
    const expires = Date.now() + 5 * 60 * 1000;

    // Temporarily store password in plain text.
    // Alternatively, you can store the hashed password now if you want
    pendingVerifications.set(email, { password, code, expires });

    // // SEND EMAIL (demo: uses Gmail - replace with your own service or .env variables)
    // const transporter = nodemailer.createTransport({
    //   service: 'Gmail',
    //   auth: {
    //     user: 'yourEmail@gmail.com',
    //     pass: 'yourAppPassword'
    //   }
    // });

    // const mailOptions = {
    //   from: 'GraySim Web <yourEmail@gmail.com>',
    //   to: email,
    //   subject: 'Your GraySim Verification Code',
    //   text: `Your code is ${code}. It expires in 5 minutes.`,
    // };

    // await transporter.sendMail(mailOptions);

    res.json({ msg: `Verification code sent to ${email}.`, devCode: code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error in /send-verify' });
  }
});

// 2) VERIFY-CODE route
app.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Check store for pending verification
    const pending = pendingVerifications.get(email);
    if (!pending) {
      return res.status(400).json({ msg: 'No verification found. Please register again.' });
    }

    // Check if expired
    if (Date.now() > pending.expires) {
      pendingVerifications.delete(email);
      return res.status(400).json({ msg: 'Code has expired. Please request a new code.' });
    }

    // Compare code
    if (code !== pending.code) {
      return res.status(400).json({ msg: 'Invalid code.' });
    }

    // Code is valid. Now create the user in Mongo.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pending.password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      acc_type: 'cadet' // or req.body if you pass it through
    });
    await user.save();

    // Cleanup
    pendingVerifications.delete(email);

    return res.json({ msg: 'Account verified and created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error in /verify-code' });
  }
});

// **Register Route**: Create a new user
app.post('/register', async (req, res) => {
  try {
    // Step 1: Extract email, password, and acc_type from the request body
    const { email, password, acc_type } = req.body;

    if (!email_validate.test(email)) {
      return res.status(400).json({ msg: 'Please use a valid @westpoint.edu email address.' });
    }

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

    // Step 1.5: Ensure email is valid
    if (!email_validate.test(email)) {
      return res.status(400).json({ msg: 'Email not valid' });
    }

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


// CPU Scheduling 

app.post("/cpu_scheduling/get_policy", (req, res) => {
  try {
    const { userID, policyName } = req.body;

    console.log("GET_POLICY endpoint hit!");
    console.log("User ID:", userID);
    console.log("Policy Name:", policyName);


  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
})

app.post("/cpu_scheduling/get_feedback", (req, res) => {
  try {
    const { userID, policyName, studentAnswer } = req.body;

    console.log("GET_FEEDBACK endpoint hit!");
    console.log("User ID:", userID);
    console.log("Policy Name:", policyName);
    console.log("Student Answer:", studentAnswer);


  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
})

app.post("/cpu_scheduling/get_solution", (req, res) => {
  try {
    const { userID, policyName, studentAnswer } = req.body;

    console.log("GET_SOLUTION endpoint hit!");
    console.log("User ID:", userID);
    console.log("Policy Name:", policyName);
    console.log("Student Answer:", studentAnswer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
})

app.post("/cpu_scheduling/reset", (req, res) => {
  try {
    const { userID } = req.body;

    console.log("RESET endpoint hit!");
    console.log("User ID:", userID);    

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
})

app.post("/cpu_scheduling/get_problem", (req, res) => {
  try {
    const { userID } = req.body;

    console.log("GET_PROBLEM endpoint hit!");
    console.log("User ID:", userID);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
})

// Page Replacement
// app.post("/page_replacement/", (req, res) => {
//   try {
//     const { cpu_sched_json } = req.body;


//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ msg: "Server error" });
//   }
// })

// // Start Scala Server when user logs in
// app.post("/start-scala", (req, res) => {
//   if (scalaServerProcess) {
//     return res.json({ msg: "Scala server is already running!" });
//   }

//   scalaServerProcess = spawn("sbt", ["run"], { cwd: "backend/scala-app" });

//   scalaServerProcess.stdout.on("data", (data) => {
//     console.log(`[SCALA OUT]: ${data}`);
//   });

//   scalaServerProcess.stderr.on("data", (data) => {
//     console.error(`[SCALA ERR]: ${data}`);
//   });

//   scalaServerProcess.on("close", () => {
//     console.log("Scala server stopped.");
//     scalaServerProcess = null;
//   });

//   res.json({ msg: "Scala server started!" });
// });

// // Stop Scala Server when user logs out
// app.post("/stop-scala", (req, res) => {
//   if (scalaServerProcess) {
//     scalaServerProcess.kill();
//     scalaServerProcess = null;
//     res.json({ msg: "Scala server stopped!" });
//   } else {
//     res.json({ msg: "Scala server is not running." });
//   }
// });

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
