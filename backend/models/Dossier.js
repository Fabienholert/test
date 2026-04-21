const mongoose = require('mongoose');

const DossierSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  client: { type: String, required: true },
  appareil: { type: String, required: true },
  descriptionPanne: { type: String },
  prixReparation: { type: Number },
  dateFinGarantie: { type: Date },
  statut: { 
    type: String, 
    required: true, 
    default: 'En attente',
    enum: ['En attente', 'En cours', 'Réparé', 'Livré', 'Rejeté']
  },
  dateCreation: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dossier', DossierSchema);
