const mongoose = require('mongoose');

const DossierSchema = new mongoose.Schema({
  numeroDossier: { type: String, required: true },
  // Add other fields here
});

module.exports = mongoose.model('Dossier', DossierSchema);
