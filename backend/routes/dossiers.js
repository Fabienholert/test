const express = require("express");
const router = express.Router();
const Dossier = require("../models/Dossier");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { extractDataFromPDF, extractRawTextFromPDF } = require("../utils/ocr"); // Assurez-vous que ces imports sont corrects

// ========== CONFIGURATION MULTER OPTIMISÉE ==========
// Créer le dossier uploads s'il n'existe pas
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// Configuration Multer avec validation stricte
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // UUID pour éviter les collisions
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Validation des fichiers
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé. Acceptés: PDF, XLSX, XLS"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
});

// ========== MIDDLEWARE VALIDATION ==========
const validateDossierData = (req, res, next) => {
  const {
    numero,
    vin,
    marque,
    modele,
    immatriculation,
    kilometrage,
    dateEntree,
  } = req.body;

  if (
    !numero ||
    !vin ||
    !marque ||
    !modele ||
    !immatriculation ||
    kilometrage === undefined ||
    !dateEntree
  ) {
    return res.status(400).json({
      message: "Champs obligatoires manquants",
      required: [
        "numero",
        "vin",
        "marque",
        "modele",
        "immatriculation",
        "kilometrage",
        "dateEntree",
      ],
    });
  }

  // Validation basique VIN
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin.toUpperCase())) {
    return res
      .status(400)
      .json({ message: "VIN invalide (17 caractères alphanumériques)" });
  }

  // Validation marque
  const marques = ["Volkswagen", "SEAT", "CUPRA", "Škoda"];
  if (!marques.includes(marque)) {
    return res
      .status(400)
      .json({ message: `Marque invalide. Acceptées: ${marques.join(", ")}` });
  }

  next();
};

// ========== ROUTES OPTIMISÉES ==========

// Analyse PDF - Extraire données (OCR côté serveur uniquement)
router.post("/analyze", upload.single("documentPdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier PDF fourni" });
    }

    const buffer = fs.readFileSync(req.file.path);
    const extractedData = await extractDataFromPDF(buffer);

    res.json(extractedData);
  } catch (err) {
    console.error("❌ Erreur analyse PDF:", err.message);

    // Nettoyer le fichier en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: `Erreur analyse: ${err.message}` });
  }
});

// Analyse MCQ - Extraire texte brut
router.post("/analyzeMCQ", upload.single("ficheMCQFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier PDF fourni" });
    }

    const buffer = fs.readFileSync(req.file.path);
    const rawText = await extractRawTextFromPDF(buffer);

    res.json({ text: rawText });
  } catch (err) {
    console.error("❌ Erreur analyse MCQ:", err.message);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res
      .status(500)
      .json({ message: "Erreur lors de l'extraction du texte du PDF" });
  }
});

// GET tous les dossiers - AVEC PAGINATION
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Filtrage optionnel
    const filter = {};
    if (req.query.marque) filter.marque = req.query.marque;
    if (req.query.statut) filter.statut = req.query.statut;
    if (req.query.typeDossier) filter.typeDossier = req.query.typeDossier;

    // Tri optionnel
    const sortBy = req.query.sortBy || "-dateCreation";

    const total = await Dossier.countDocuments(filter);
    const dossiers = await Dossier.find(filter)
      .select("-__v")
      .sort(sortBy)
      .limit(limit)
      .skip(skip)
      .lean(); // Optimisation: lean() retourne des objets simples

    res.json({
      data: dossiers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Erreur GET dossiers:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET un dossier par ID
router.get("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const dossier = await Dossier.findById(req.params.id).lean();

    if (!dossier) {
      return res.status(404).json({ message: "Dossier non trouvé" });
    }

    res.json(dossier);
  } catch (err) {
    console.error("❌ Erreur GET dossier:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST un nouveau dossier
router.post(
  "/",
  upload.fields([
    { name: "fichePedagogiqueFile", maxCount: 1 },
    { name: "ficheMCQFile", maxCount: 1 },
    { name: "documentPdfFile", maxCount: 1 },
  ]),
  validateDossierData,
  async (req, res) => {
    try {
      const dossierData = { ...req.body };

      // Gestion des fichiers uploadés
      if (req.files) {
        if (req.files["fichePedagogiqueFile"]) {
          dossierData.fichePedagogiqueUrl = `/uploads/${req.files["fichePedagogiqueFile"][0].filename}`;
        }
        if (req.files["ficheMCQFile"]) {
          dossierData.ficheMCQUrl = `/uploads/${req.files["ficheMCQFile"][0].filename}`;
        }
        if (req.files["documentPdfFile"]) {
          dossierData.documentPdfUrl = `/uploads/${req.files["documentPdfFile"][0].filename}`;
        }
      }

      const dossier = new Dossier(dossierData);
      const newDossier = await dossier.save();

      res.status(201).json(newDossier);
    } catch (err) {
      console.error("❌ Erreur POST dossier:", err.message);

      // Nettoyer les fichiers en cas d'erreur
      if (req.files) {
        Object.values(req.files).forEach((files) => {
          files.forEach((file) => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }

      res.status(400).json({ message: err.message });
    }
  },
);

// PUT mettre à jour un dossier
router.put(
  "/:id",
  upload.fields([
    { name: "fichePedagogiqueFile", maxCount: 1 },
    { name: "ficheMCQFile", maxCount: 1 },
    { name: "documentPdfFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "ID invalide" });
      }

      const updateData = { ...req.body };

      // Récupérer l'ancien dossier pour nettoyer les anciens fichiers
      const oldDossier = await Dossier.findById(req.params.id);

      if (req.files) {
        if (req.files["fichePedagogiqueFile"]) {
          // Supprimer l'ancien fichier
          if (oldDossier?.fichePedagogiqueUrl) {
            const oldPath = path.join(
              __dirname,
              "..",
              oldDossier.fichePedagogiqueUrl,
            );
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData.fichePedagogiqueUrl = `/uploads/${req.files["fichePedagogiqueFile"][0].filename}`;
        }
        if (req.files["ficheMCQFile"]) {
          if (oldDossier?.ficheMCQUrl) {
            const oldPath = path.join(__dirname, "..", oldDossier.ficheMCQUrl);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData.ficheMCQUrl = `/uploads/${req.files["ficheMCQFile"][0].filename}`;
        }
        if (req.files["documentPdfFile"]) {
          if (oldDossier?.documentPdfUrl) {
            const oldPath = path.join(
              __dirname,
              "..",
              oldDossier.documentPdfUrl,
            );
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData.documentPdfUrl = `/uploads/${req.files["documentPdfFile"][0].filename}`;
        }
      }

      const updatedDossier = await Dossier.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true },
      );

      if (!updatedDossier) {
        return res.status(404).json({ message: "Dossier non trouvé" });
      }

      res.json(updatedDossier);
    } catch (err) {
      console.error("❌ Erreur PUT dossier:", err.message);

      // Nettoyer les fichiers en cas d'erreur
      if (req.files) {
        Object.values(req.files).forEach((files) => {
          files.forEach((file) => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }

      res.status(400).json({ message: err.message });
    }
  },
);

// DELETE supprimer un dossier
router.delete("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const dossier = await Dossier.findByIdAndDelete(req.params.id);

    if (!dossier) {
      return res.status(404).json({ message: "Dossier non trouvé" });
    }

    // Nettoyer les fichiers associés
    const filesToDelete = [
      dossier.fichePedagogiqueUrl,
      dossier.ficheMCQUrl,
      dossier.documentPdfUrl,
    ];

    filesToDelete.forEach((url) => {
      if (url) {
        const filePath = path.join(__dirname, "..", url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    res.json({ message: "Dossier supprimé avec succès" });
  } catch (err) {
    console.error("❌ Erreur DELETE dossier:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// Gestion des erreurs Multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "Fichier trop volumineux (max 50MB)" });
    }
  }
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

module.exports = router;
