const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const passwordResetTokenSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Document deletes itself after 5 minutes
  },
});

// FIX: Removed 'next' parameter and 'next()' call
passwordResetTokenSchema.pre('save', async function () {
  if (this.isModified('token')) {
    const hash = await bcrypt.hash(this.token, 10);
    this.token = hash;
  }
});

// Helper to verify token
passwordResetTokenSchema.methods.compareToken = async function (token) {
  return await bcrypt.compare(token, this.token);
};

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);