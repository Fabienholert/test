const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailService");

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn(
    "ATTENTION: EMAIL_USER ou EMAIL_PASS n'est pas défini dans le fichier .env. Les emails d'inscription ne pourront pas être envoyés.",
  );
}

// POST Inscription
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username,
      password: hashedPassword,
      isApproved: false,
    });
    const newUser = await user.save();

    // Tenter d'envoyer un mail à l'admin
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Sur Render, il est préférable d'utiliser une variable d'env pour l'URL
      const backendUrl =
        process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;

      try {
        await sendEmail({
          to: "fabienholert@gmail.com",
          subject: "🚀 Nouvelle demande d'inscription - Audit Garantie",
          text: `Nouvel utilisateur : ${username}. Approuver ici : ${backendUrl}/api/users/approve/${newUser._id}`,
          html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Nouvelle inscription</h2>
            <p>Un nouvel utilisateur souhaite accéder à l'application :</p>
            <p><strong>Email :</strong> ${username}</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${backendUrl}/api/users/approve/${newUser._id}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                 APPROUVER L'UTILISATEUR
              </a>
            </div>
          </div>
        `,
        });
        console.log("Email de demande d'approbation envoyé.");
      } catch (mailError) {
        console.error("Erreur technique mail:", mailError);
      }
    } else {
      console.warn("Email non envoyé : EMAIL_USER ou EMAIL_PASS manquant.");
    }

    res
      .status(201)
      .json({
        message:
          "Demande d'inscription envoyée. En attente de validation par l'administrateur.",
      });
  } catch (err) {
    console.error("Détail de l'erreur d'inscription:", err);
    res
      .status(500)
      .json({ message: "Erreur lors de l'inscription. Veuillez réessayer." });
  }
});

// POST Connexion
// GET Approbation (via lien email)
router.get("/approve/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    user.isApproved = true;
    await user.save();

    res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: #4CAF50;">Utilisateur approuvé !</h1>
        <p>L'utilisateur <strong>${user.username}</strong> peut maintenant se connecter.</p>
        <a href="${process.env.CLIENT_URL || "http://localhost:3000"}" 
           style="display: inline-block; padding: 10px 20px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px;">
           Retour à l'application
        </a>
      </div>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'approbation");
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user == null) {
      return res.status(400).send("Utilisateur non trouvé");
    }

    if (!user.isApproved) {
      return res
        .status(403)
        .send(
          "Votre compte est en attente de validation par l'administrateur.",
        );
    }

    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
      );
      res.json({ token: accessToken }); // Changé en 'token' pour correspondre au frontend
    } else {
      res.status(401).send("Mot de passe incorrect");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

module.exports = router;
