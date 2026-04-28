const express = require('express');
const router = express.Router();
const Dossier = require('../models/Dossier');
const multer = require('multer');
const path = require('path');
const { extractDataFromPDF, extractRawTextFromPDF } = require('../utils/ocr');
const fs = require('fs');

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

// Route d'analyse de PDF
router.post('/analyze', upload.single('documentPdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier PDF fourni' });
    }

    const buffer = fs.readFileSync(req.file.path);
    const extractedData = await extractDataFromPDF(buffer);
    
    // Supprimer le fichier temporaire après analyse si nécessaire, 
    // ou le laisser si on veut le garder. Ici on le garde car il sera utilisé pour le dossier.
    
    res.json(extractedData);
  } catch (err) {
    console.error('Erreur analyse PDF:', err);
    res.status(500).json({ message: 'Erreur lors de l\'analyse du PDF' });
  }
});

// Route d'analyse brute de PDF (MCQ)
router.post('/analyzeMCQ', upload.single('ficheMCQFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier PDF fourni' });
    }

    const buffer = fs.readFileSync(req.file.path);
    const rawText = await extractRawTextFromPDF(buffer);
    
    res.json({ text: rawText });
  } catch (err) {
    console.error('Erreur analyse brute PDF:', err);
    res.status(500).json({ message: 'Erreur lors de l\'extraction du texte du PDF' });
  }
});

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
router.post('/', upload.fields([
  { name: 'fichePedagogiqueFile', maxCount: 1 },
  { name: 'ficheMCQFile', maxCount: 1 },
  { name: 'documentPdfFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const dossierData = { ...req.body };
    
    // Gestion des fichiers uploadés
    if (req.files) {
      if (req.files['fichePedagogiqueFile']) {
        dossierData.fichePedagogiqueUrl = `/uploads/${req.files['fichePedagogiqueFile'][0].filename}`;
      }
      if (req.files['ficheMCQFile']) {
        dossierData.ficheMCQUrl = `/uploads/${req.files['ficheMCQFile'][0].filename}`;
      }
      if (req.files['documentPdfFile']) {
        dossierData.documentPdfUrl = `/uploads/${req.files['documentPdfFile'][0].filename}`;
      }
    }

    const dossier = new Dossier(dossierData);
    const newDossier = await dossier.save();
    res.status(201).json(newDossier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT mettre à jour un dossier
router.put('/:id', upload.fields([
  { name: 'fichePedagogiqueFile', maxCount: 1 },
  { name: 'ficheMCQFile', maxCount: 1 },
  { name: 'documentPdfFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.files) {
      if (req.files['fichePedagogiqueFile']) {
        updateData.fichePedagogiqueUrl = `/uploads/${req.files['fichePedagogiqueFile'][0].filename}`;
      }
      if (req.files['ficheMCQFile']) {
        updateData.ficheMCQUrl = `/uploads/${req.files['ficheMCQFile'][0].filename}`;
      }
      if (req.files['documentPdfFile']) {
        updateData.documentPdfUrl = `/uploads/${req.files['documentPdfFile'][0].filename}`;
      }
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
