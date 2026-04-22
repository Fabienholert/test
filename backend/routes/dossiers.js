const express = require('express');
const router = express.Router();
const Dossier = require('../models/Dossier');
const multer = require('multer');
const path = require('path');

// Configuration Multer pour les pièces jointes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

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
router.post('/', upload.single('fichePedagogiqueFile'), async (req, res) => {
  try {
    const dossierData = { ...req.body };
    
    // Si un fichier a été uploadé, on enregistre son URL
    if (req.file) {
      dossierData.fichePedagogiqueUrl = `/uploads/${req.file.filename}`;
    }

    const dossier = new Dossier(dossierData);
    const newDossier = await dossier.save();
    res.status(201).json(newDossier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT mettre à jour un dossier
router.put('/:id', upload.single('fichePedagogiqueFile'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.fichePedagogiqueUrl = `/uploads/${req.file.filename}`;
    }

    const updatedDossier = await Dossier.findByIdAndUpdate(
      req.params.id,
      updateData,
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
