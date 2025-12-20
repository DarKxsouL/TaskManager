const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, default: '' },

  role: { 
      type: String, 
      enum: ['Admin', 'Employee', 'CEO'], 
      default: 'Employee' 
  },

  jobRole: { type: String, default: 'N/A' },
  designation: { type: String, default: 'Employee' }
});

module.exports = mongoose.model('User', UserSchema);