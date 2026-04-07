require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    // Connexion MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecté...');
    
    // Vérifier si des utilisateurs existent déjà
    const count = await User.countDocuments();
    if (count > 0) {
      console.log(`${count} utilisateur(s) existent déjà. Seed ignoré.`);
      await mongoose.disconnect();
      return;
    }
    
    // Créer 2 utilisateurs par défaut
    const users = [
      {
        email: 'technicien@vw.com',
        password: 'Technicien123!',
        nom: 'Dupont',
        prenom: 'Jean'
      },
      {
        email: 'manager@vw.com',
        password: 'Manager123!',
        nom: 'Martin',
        prenom: 'Marie'
      }
    ];
    
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✓ Utilisateur créé: ${userData.email}`);
    }
    
    console.log('\n✅ Base de données initialisée avec succès!');
    console.log('\nIdentifiants de test:');
    console.log('  1. Email: technicien@vw.com | Motdepasse: Technicien123!');
    console.log('  2. Email: manager@vw.com | Motdepasse: Manager123!');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Erreur lors du seed:', error.message);
    process.exit(1);
  }
};

seedUsers();
