const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function testConnection() {
  console.log('Tentative de connexion (timeout 10s)...');
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ CONNEXION RÉUSSIE !');
    process.exit(0);
  } catch (err) {
    console.error('❌ ÉCHEC DE CONNEXION :');
    console.error(err.message);
    process.exit(1);
  }
}

testConnection();
