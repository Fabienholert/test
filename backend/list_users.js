const mongoose = require('mongoose');
const User = require('./models/User');

async function listUsers() {
  await mongoose.connect('mongodb://localhost:27017/garantie_test');
  const users = await User.find({});
  console.log('Liste des utilisateurs :', users);
  process.exit();
}

listUsers();
