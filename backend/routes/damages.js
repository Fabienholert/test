const express = require("express");
const router = express.Router();
const {
  searchByLabel,
  getCodeByLabel,
  getAllDamages,
} = require("../services/damagesService");

// GET rechercher les dommages par libellé
router.get("/search", (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.status(400).json({ error: "Minimum 2 caractères requis" });
  }

  const results = searchByLabel(q);
  res.json(results);
});

// GET obtenir le code pour un libellé exact
router.get("/code/:label", (req, res) => {
  const { label } = req.params;
  const code = getCodeByLabel(decodeURIComponent(label));

  if (!code) {
    return res.status(404).json({ error: "Dommage non trouvé" });
  }

  res.json({ code });
});

// GET tous les dommages
router.get("/all", (req, res) => {
  const damages = getAllDamages();
  res.json(damages);
});

module.exports = router;
