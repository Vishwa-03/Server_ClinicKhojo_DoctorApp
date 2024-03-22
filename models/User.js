const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt'); // For password hashing

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: { // Add password field for user authentication
    type: String,
    required: true
  },
  profilePicture: { // Optional field for profile picture URL
    type: String,
    default: ''
  },
  phone: { // Add phone number for communication
    type: String,
    required:true,
  },
  // ... other user fields (e.g., address, date of birth)
});

// Pre-save hook for password hashing (optional)
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    // Hash the password before saving
    this.password = await bcrypt.hash(this.password, 10); // Adjust salt rounds as needed
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
