// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create an Express app
const app = express();

// Middleware: Parse JSON bodies from HTTP requests
app.use(express.json());
app.use(cors())

// Connect to MongoDB
// Can replace with a West Point server name later
mongoose.connect('mongodb://localhost:27017/cadets', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB is connected!'))
.catch(err => console.error('MongoDB connection error:', err));

// Define a User schema with Mongoose
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Create a User model from the schema
const User = mongoose.model('User', userSchema);

// **Register Route**: Create a new user
app.post('/register', async (req, res) => {
  try {
    // Step 1: Extract username and password from the request body
    const { username, password } = req.body;
  

    // Step 2: Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: 'Username already exists!' });
    }

    // Step 3: Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Step 4: Create a new user with the hashed password
    const user = new User({ username, password: hashedPassword });
    await user.save();

    // Step 5: Create a JWT (JSON Web Token) so the user can be authenticated in future requests
    const payload = { userId: user._id };
    // In a production app, store your secret in an environment variable!
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
    // Step 1: Extract username and password from the request body
    const { username, password } = req.body;

    // Step 2: Find the user by username
    const user = await User.findOne({ username });
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

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
