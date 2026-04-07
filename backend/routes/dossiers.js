const express = require("express");
const router = express.Router();
const Dossier = require("../models/Dossier");

// GET tous les dossiers
router.get("/", async (req, res) => {
  try {
    const dossiers = await Dossier.find().sort({ createdAt: -1 }).limit(100);
    res.json(dossiers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET un dossier par ID
router.get("/:id", async (req, res) => {
  try {
    const dossier = await Dossier.findById(req.params.id);
    if (!dossier) {
      return res.status(404).json({ error: "Dossier not found" });
    }
    res.json(dossier);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST créer un nouveau dossier
router.post("/", async (req, res) => {
  try {
    const dossier = new Dossier(req.body);
    await dossier.save();
    res.status(201).json(dossier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT mettre à jour un dossier
router.put("/:id", async (req, res) => {
  try {
    const dossier = await Dossier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dossier) {
      return res.status(404).json({ error: "Dossier not found" });
    }
    res.json(dossier);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE un dossier
router.delete("/:id", async (req, res) => {
  try {
    const dossier = await Dossier.findByIdAndDelete(req.params.id);
    if (!dossier) {
      return res.status(404).json({ error: "Dossier not found" });
    }
    res.json({ message: "Dossier deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET statistiques
router.get("/stats/overview", async (req, res) => {
  try {
    const total = await Dossier.countDocuments();
    const docsOk = await Dossier.countDocuments({ docsOK: true });
    const nouveau = await Dossier.countDocuments({ statut: "Nouveau" });

    res.json({
      total,
      docsOk,
      nouveau,
      pourcentage: total > 0 ? Math.round((docsOk / total) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
