const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
      isApproved: true,
    });
    await user.save();

    res.status(201).json({
      message: "Inscription réussie. Vous pouvez maintenant vous connecter.",
    });
  } catch (err) {
    console.error("Détail de l'erreur d'inscription:", err);
    res
      .status(500)
      .json({ message: "Erreur lors de l'inscription. Veuillez réessayer." });
  }
});

// POST Connexion
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user == null) {
      return res.status(400).send("Utilisateur non trouvé");
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
