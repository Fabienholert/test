const mongoose = require('mongoose');

const DossierSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  vin: { type: String, required: true },
  marque: { type: String, required: true, enum: ['Volkswagen', 'SEAT', 'CUPRA', 'Škoda'] },
  modele: { type: String, required: true },
  immatriculation: { type: String, required: true },
  kilometrage: { type: Number, required: true },
  lettreMoteur: { type: String },
  typeVehicule: { type: String },
  dateEntree: { type: Date, required: true },
  dateImpression: { type: Date },
  typeDossier: { 
    type: String, 
    required: true, 
    default: 'Garantie',
    enum: ['Garantie', 'MCQ']
  },
  // Champs spécifiques Garantie
  isDISS: { type: Boolean, default: false },
  numDISS: { type: [String], default: [] },
  isTPI: { type: Boolean, default: false },
  numTPI: { type: String },
  hasFichePedagogique: { type: Boolean, default: false },
  fichePedagogiqueUrl: { type: String },
  descriptionPanne: { type: String },
  // Champs spécifiques MCQ
  numeroMCQ: { type: String },
  critere: { type: String },
  ficheMCQUrl: { type: String },
  // Champs communs
  documentPdfUrl: { type: String },
  isPointageVerifie: { type: Boolean, default: false },
  nomTechnicien: { type: String },
  dommage: { type: String },
  libelleDommage: { type: String },
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
