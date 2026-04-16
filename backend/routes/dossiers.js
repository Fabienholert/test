const express = require('express');
const router = express.Router();
const Dossier = require('../models/Dossier');

// --- CRUD Routes pour les dossiers ---

// GET tous les dossiers
router.get('/', async (req, res) => {
  try {
    const dossiers = await Dossier.find();
    res.json(dossiers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST un nouveau dossier
router.post('/', async (req, res) => {
  const dossier = new Dossier({
    numero: req.body.numero,
    client: req.body.client,
    statut: req.body.statut
  });
  try {
    const newDossier = await dossier.save();
    res.status(201).json(newDossier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ... (Ajouter PUT, DELETE etc. si nécessaire)

module.exports = router;
