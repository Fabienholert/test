const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

// Configuration du transporteur d'email (à configurer dans .env)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('ATTENTION: EMAIL_USER ou EMAIL_PASS n\'est pas défini dans le fichier .env. Les emails d\'inscription ne pourront pas être envoyés.');
}

// POST Inscription
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username,
      password: hashedPassword,
      isApproved: true 
    });
    const newUser = await user.save();

    // Tenter d'envoyer un mail à l'admin
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'fabienholert@gmail.com',
        subject: 'Nouvelle demande d\'inscription',
        text: `Une nouvelle personne souhaite s'inscrire avec l'email : ${username}. Veuillez valider son compte dans la base de données.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('ERREUR lors de l\'envoi de l\'email:', error.message);
        } else {
          console.log('Email envoyé avec succès à l\'administrateur.');
        }
      });
    } else {
      console.warn('Email non envoyé : EMAIL_USER ou EMAIL_PASS manquant.');
    }

    res.status(201).json({ message: 'Demande d\'inscription envoyée. En attente de validation par l\'administrateur.' });
  } catch (err) {
    console.error('Détail de l\'erreur d\'inscription:', err);
    res.status(500).json({ message: 'Erreur lors de l\'inscription. Veuillez réessayer.' });
  }
});

// POST Connexion
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user == null) {
      return res.status(400).send('Utilisateur non trouvé');
    }

    if (!user.isApproved) {
      return res.status(403).send('Votre compte est en attente de validation par l\'administrateur.');
    }

    if(await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = jwt.sign({ username: user.username }, process.env.JWT_SECRET);
      res.json({ token: accessToken }); // Changé en 'token' pour correspondre au frontend
    } else {
      res.status(401).send('Mot de passe incorrect');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
});

module.exports = router;
