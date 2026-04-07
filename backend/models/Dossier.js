const mongoose = require("mongoose");

const dossierSchema = new mongoose.Schema(
  {
    // Section A - Conformité
    reclamation: {
      type: String,
      required: true,
    },
    signature: {
      type: Boolean,
      default: false,
    },
    dateEntree: {
      type: Date,
      required: true,
    },
    dateImpression: {
      type: Date,
    },

    // Section B - Capture de données
    orNumber: {
      type: String,
      unique: true,
      required: true,
    },
    dissNumber: String,
    vin: String,
    model: String,
    km: Number,
    technicien: String,
    pointageAtelier: String,
    codeDommage: String,
    codeAvarie: String,
    dissOpen: String,
    protocole: {
      type: String,
      enum: ["Oui", "Non"],
    },
    ppso: {
      type: String,
      enum: ["Oui", "Non"],
    },
    fichePedagogique: {
      type: String,
      enum: ["Oui", "Non"],
    },
    tpi: {
      type: String,
      enum: ["Oui", "Non"],
    },
    dateDiag: Date,
    sortiepromise: String,

    // Métadonnées
    docsOK: {
      type: Boolean,
      default: false,
    },
    statut: {
      type: String,
      enum: ["Nouveau", "En cours", "Terminé"],
      default: "Nouveau",
    },
  },
  {
    timestamps: true,
  },
);

// Hook pour calculer docsOK automatiquement
dossierSchema.pre("save", function (next) {
  const conditions =
    this.protocole === "Oui" &&
    this.ppso === "Oui" &&
    this.fichePedagogique !== "Non" &&
    this.tpi !== "Non";
  this.docsOK = conditions;
  next();
});

module.exports = mongoose.model("Dossier", dossierSchema);
