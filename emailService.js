const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1. Créer un transporter (configuration du service d'envoi)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Optionnel: pour éviter les problèmes de certificat en dev, mais à éviter en production
    // tls: {
    //   rejectUnauthorized: false
    // }
  });

  // 2. Définir les options de l'e-mail
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text, // Version texte brut pour les clients e-mail qui ne supportent pas HTML
  };

  // 3. Envoyer l'e-mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
