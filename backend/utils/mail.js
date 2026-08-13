// const nodemailer = require('nodemailer');

// // Helper to generate 6-digit random code
// const generateOTP = () => {
//   let otp = '';
//   for (let i = 0; i <= 5; i++) {
//     otp += Math.round(Math.random() * 9);
//   }
//   return otp;
// };

// // Configure your email provider
// const mailTransport = nodemailer.createTransport({
//   service: 'gmail', // Use your provider (Gmail, Outlook, etc.)
//   auth: {
//     user: process.env.EMAIL_USERNAME, // Put this in your .env file
//     pass: process.env.EMAIL_PASSWORD, // Put this in your .env file
//   },
// });

// module.exports = { generateOTP, mailTransport };


const nodemailer = require('nodemailer');

// Fix: i < 6 (was i <= 5, which gave 7 digits)
const generateOTP = () => {
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD, // ← now this is the App Password
  },
});

// Reusable styled email sender
const sendOTPEmail = async (toEmail, otp) => {
  await mailTransport.sendMail({
    from: `"Taskify Security" <${process.env.EMAIL_USERNAME}>`,
    to: toEmail,
    subject: 'Your Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #1d4ed8; margin-bottom: 8px;">Password Reset</h2>
        <p style="color: #374151;">Use the OTP below to reset your password. It expires in <strong>5 minutes</strong>.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #111827; background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email. Do not share this code with anyone.</p>
      </div>
    `
  });
};

const sendPasswordChangedEmail = async (toEmail) => {
  await mailTransport.sendMail({
    from: `"Taskify Security" <${process.env.EMAIL_USERNAME}>`,
    to: toEmail,
    subject: 'Your Password Was Changed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #16a34a;">Password Updated</h2>
        <p style="color: #374151;">Your Taskify password was successfully changed.</p>
        <p style="color: #6b7280; font-size: 13px;">If you didn't do this, contact your admin immediately.</p>
      </div>
    `
  });
};

module.exports = { generateOTP, mailTransport, sendOTPEmail, sendPasswordChangedEmail };