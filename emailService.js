const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465 (SSL/TLS), false for other ports (like 587 for STARTTLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // For port 587 (secure: false), requireTLS ensures STARTTLS is used.
    // For port 465 (secure: true), requireTLS is ignored as connection is already secured.
    requireTLS: process.env.EMAIL_PORT == 587,
    tls: {
      rejectUnauthorized: false, // Aide souvent à passer sur Render
    },
  });

  const mailOptions = {
    from: `"Audit Garantie" <${process.env.EMAIL_USER || "no-reply@example.com"}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Nodemailer sendMail error:", error);
    throw error; // Re-throw to be caught by the calling function (users.js)
  }
};

module.exports = sendEmail;
