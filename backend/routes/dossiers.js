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

// GET un dossier par ID
router.get('/:id', async (req, res) => {
  try {
    const dossier = await Dossier.findById(req.params.id);
    if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé' });
    res.json(dossier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST un nouveau dossier
router.post('/', async (req, res) => {
  const dossier = new Dossier({
    numero: req.body.numero,
    vin: req.body.vin,
    marque: req.body.marque,
    modele: req.body.modele,
    immatriculation: req.body.immatriculation,
    kilometrage: req.body.kilometrage,
    dateEntree: req.body.dateEntree,
    dateImpression: req.body.dateImpression,
    descriptionPanne: req.body.descriptionPanne,
    dateFinGarantie: req.body.dateFinGarantie,
    statut: req.body.statut || 'En attente'
  });
  try {
    const newDossier = await dossier.save();
    res.status(201).json(newDossier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT mettre à jour un dossier
router.put('/:id', async (req, res) => {
  try {
    const updatedDossier = await Dossier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDossier) return res.status(404).json({ message: 'Dossier non trouvé' });
    res.json(updatedDossier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE supprimer un dossier
router.delete('/:id', async (req, res) => {
  try {
    const dossier = await Dossier.findByIdAndDelete(req.params.id);
    if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé' });
    res.json({ message: 'Dossier supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
