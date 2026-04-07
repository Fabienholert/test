require('dotenv').config();
const mongoose = require('mongoose');

const seedDatabase = async () => {
  try {
    // Connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté');
    
    // Aucun seed par défaut - les utilisateurs s'inscrivent via l'application
    console.log('Pas de seed de données. Les utilisateurs s\'inscrivent via l\'application avec vérification email.');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

seedDatabase();
