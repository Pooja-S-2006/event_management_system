// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Mongoose User model
const User = require('./models/User'); // ✅ Make sure this path is correct

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI;
    
    if (!mongoURI) {
      console.log('⚠️ MONGO_URI not found, using local MongoDB...');
      mongoURI = 'mongodb://localhost:27017/event-app';
    }
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4
    };
    
    console.log('🔗 Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI, options);
    
    console.log('✅ MongoDB connected successfully!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection URL: ${mongoose.connection.host}:${mongoose.connection.port}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    
    // Try local MongoDB as fallback
    if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('localhost')) {
      console.log('🔄 Trying local MongoDB as fallback...');
      try {
        await mongoose.connect('mongodb://localhost:27017/event-app', {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
        console.log('✅ Connected to local MongoDB successfully!');
      } catch (localErr) {
        console.error('❌ Local MongoDB also failed:', localErr.message);
        console.log('💡 Please ensure MongoDB is running locally or check your Atlas connection');
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// Monitor database connection
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// ✅ Example route to test API
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API is running!',
    database: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected',
    timestamp: new Date().toISOString()
  });
});

// ✅ Signup route
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection not available' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password // Note: In production, hash this password!
    });

    await newUser.save();
    console.log('✅ New user created:', email);

    // Return success response
    return res.json({
      message: '✅ User registered successfully!',
      user: {
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (err) {
    console.error('❌ Signup error:', err);
    return res.status(500).json({ error: 'Server error during signup' });
  }
});

// ✅ Example login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection not available' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check password (note: this is plaintext, ideally hash in production!)
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Return success response
    return res.json({
      message: '✅ Login successful',
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
