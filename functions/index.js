const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Load SMTP credentials
const smtpEmail = functions.config().smtp.email;
const smtpPassword = functions.config().smtp.password;
const smtpHost = functions.config().smtp.host;

// Create transporter
const transporter = nodemailer.createTransport({
  service: smtpHost,
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

exports.sendEmail = functions.https.onCall(async (data, context) => {
  const { to, subject, text, html } = data;

  const mailOptions = {
    from: smtpEmail,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});
