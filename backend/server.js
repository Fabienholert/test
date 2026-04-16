require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// --- Routes API ---
const dossiersRouter = require('./routes/dossiers');
const usersRouter = require('./routes/users');

app.use('/api/dossiers', dossiersRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// --- Servir le Frontend en Production ---
const buildPath = path.resolve(__dirname, '..', 'client', 'build');
app.use(express.static(buildPath));

// Fallback pour toutes les autres routes non-API -> servir l'app React
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
