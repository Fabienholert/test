require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const dossierRoutes = require('./routes/dossiers');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

app.use('/api/dossiers', dossierRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// --- Servir le Frontend en Production ---
const buildPath = path.join(__dirname, '..', 'dist');
app.use(express.static(buildPath));

// La correction est ici : app.get('*', ...) au lieu de app.get('*_backend', ...)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
