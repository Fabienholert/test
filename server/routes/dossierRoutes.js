const express = require('express');
const router = express.Router();
const Dossier = require('../models/Dossier');
const auth = require('../middleware/auth');

// Get all dossiers
router.get('/', auth, async (req, res) => {
  const dossiers = await Dossier.find();
  res.json(dossiers);
});

module.exports = router;
