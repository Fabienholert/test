const nodemailer = require("nodemailer");

// À configurer avec vos identifiants Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "fabienholert@gmail.com",
    pass: process.env.GMAIL_PASSWORD || "", // À fournir au démarrage
  },
});

const sendVerificationEmail = async (email, verificationToken, prenom) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .header { background: linear-gradient(135deg, #FF8C00, #0066CC); color: white; padding: 20px; text-align: center; border-radius: 5px; }
          .content { background: white; padding: 20px; margin-top: 20px; border-radius: 5px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .btn { display: inline-block; background-color: #FF8C00; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Audit Garantie VW</h1>
            <p>Vérification de votre adresse email</p>
          </div>
          <div class="content">
            <h2>Bienvenue ${prenom} !</h2>
            <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
            <center>
              <a href="${verificationLink}" class="btn">Vérifier mon email</a>
            </center>
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p><small>${verificationLink}</small></p>
            <p style="color: #999; font-size: 12px;">
              Ce lien expirera dans 24 heures.
            </p>
          </div>
          <div class="footer">
            <p>Audit Garantie VW © 2024</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER || "fabienholert@gmail.com",
      to: email,
      subject: "🔐 Vérifiez votre adresse email - Audit Garantie VW",
      html: htmlContent,
    });

    // En développement, afficher le token en logs pour le tester facilement
    if (process.env.NODE_ENV === "development") {
      console.log("\n" + "=".repeat(60));
      console.log("📧 EMAIL DE VÉRIFICATION ENVOYÉ À:", email);
      console.log("=".repeat(60));
      console.log("🔗 LIEN DE VÉRIFICATION (pour tester en local):");
      console.log(
        `   http://localhost:5174/verify-email?token=${verificationToken}`,
      );
      console.log("=".repeat(60) + "\n");
    }

    return { success: true };
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendVerificationEmail, transporter };
