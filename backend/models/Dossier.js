const mongoose = require('mongoose');

const DossierSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  vin: { type: String, required: true },
  marque: { type: String, required: true, enum: ['Volkswagen', 'SEAT', 'CUPRA', 'Škoda'] },
  modele: { type: String, required: true }, // ex: Golf, Leon, Formentor...
  immatriculation: { type: String, required: true }, // ex: AB-123-CD
  kilometrage: { type: Number, required: true },
  dateEntree: { type: Date, required: true },
  dateImpression: { type: Date },
  isDISS: { type: Boolean, default: false },
  numDISS: { type: String },
  isTPI: { type: Boolean, default: false },
  numTPI: { type: String },
  descriptionPanne: { type: String },
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
