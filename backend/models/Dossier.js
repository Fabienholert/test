const mongoose = require('mongoose');

const DossierSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  client: { type: String, required: true },
  statut: { type: String, required: true, default: 'En attente' },
  dateCreation: { type: Date, default: Date.now },
  // ... autres champs que vous pourriez vouloir ajouter
});

module.exports = mongoose.model('Dossier', DossierSchema);
