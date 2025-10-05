const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Create users directory if it doesn't exist
const usersFile = path.join(__dirname, 'users.json');

// Test user data
// Generate a salt and hash the password
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('password123', salt);

const testUser = {
  id: Date.now(),
  name: 'Test User',
  email: 'test@example.com',
  password: hashedPassword,
  createdAt: new Date().toISOString()
};

// Read existing users or create new array
let users = [];
if (fs.existsSync(usersFile)) {
  users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}

// Check if test user already exists
const userExists = users.some(user => user.email === testUser.email);

if (!userExists) {
  users.push(testUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  console.log('✅ Test user created successfully!');
  console.log('Email: test@example.com');
  console.log('Password: password123');
} else {
  console.log('ℹ️ Test user already exists');
  console.log('Email: test@example.com');
  console.log('Password: password123');
}
