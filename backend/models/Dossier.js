const mongoose = require('mongoose');

const DossierSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  client: { type: String, required: true },
  vehicule: { type: String, required: true }, // ex: Peugeot 3008
  immatriculation: { type: String, required: true }, // ex: AB-123-CD
  kilometrage: { type: Number, required: true },
  dateEntree: { type: Date, required: true },
  dateImpression: { type: Date },
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
