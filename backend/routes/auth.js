const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const { sendVerificationEmail } = require("../services/emailService");
const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = "24h";

// POST - Enregistrer un nouvel utilisateur (avec vérification d'email)
router.post("/register", async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;

    // Validation
    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Le mot de passe doit faire au moins 6 caractères" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // Générer un token de vérification
    const verificationToken = uuidv4();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Créer l'utilisateur
    const user = new User({
      email,
      password,
      nom,
      prenom,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await user.save();

    // Envoyer l'email de vérification
    const emailResult = await sendVerificationEmail(
      email,
      verificationToken,
      prenom,
    );
    if (!emailResult.success) {
      // L'utilisateur est créé mais l'email n'a pas pu être envoyé
      return res.status(500).json({
        error:
          "Compte créé mais email de vérification non envoyé. Veuillez contacter le support.",
        details: emailResult.error,
      });
    }

    res.status(201).json({
      message:
        "Inscription réussie ! Vérifiez votre email pour activer votre compte.",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Vérifier l'email avec le token
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Token invalide ou expiré" });
    }

    // Marquer l'utilisateur comme vérifié
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    // Générer le token JWT
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );

    res.json({
      message: "Email vérifié avec succès !",
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Connexion utilisateur
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email et password requis" });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email ou password incorrect" });
    }

    // Vérifier que l'email est vérifié
    if (!user.isVerified) {
      return res
        .status(401)
        .json({ error: "Veuillez d'abord vérifier votre email" });
    }

    // Vérifier le password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email ou password incorrect" });
    }

    // Générer le token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtenir les infos de l'utilisateur connecté
router.get("/me", require("../middleware/auth"), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
