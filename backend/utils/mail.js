const nodemailer = require('nodemailer');

// Helper to generate 6-digit random code
const generateOTP = () => {
  let otp = '';
  for (let i = 0; i <= 5; i++) {
    otp += Math.round(Math.random() * 9);
  }
  return otp;
};

// Configure your email provider
const mailTransport = nodemailer.createTransport({
  service: 'gmail', // Use your provider (Gmail, Outlook, etc.)
  auth: {
    user: process.env.EMAIL_USERNAME, // Put this in your .env file
    pass: process.env.EMAIL_PASSWORD, // Put this in your .env file
  },
});

module.exports = { generateOTP, mailTransport };