require('dotenv').config(); // Pour charger les variables d'environnement
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Nécéssaire pour servir les fichiers statiques

const dossierRoutes = require('./routes/dossiers');
const userRoutes = require('./routes/users');

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json()); 

// --- Connexion à la base de données ---
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// --- Routes de l'API ---
// Toutes les routes de l'API sont préfixées par /api
app.use('/api/dossiers', dossierRoutes);
app.use('/api/users', userRoutes);

// Route pour le health check de Render
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});


// --- Servir le Frontend en Production ---
// Cette section est cruciale pour le déploiement sur Render

// 1. Définir le chemin vers le dossier de build du frontend
// On remonte d'un niveau (de backend à la racine) puis on entre dans 'dist'
const buildPath = path.join(__dirname, '..', 'dist');

// 2. Servir les fichiers statiques (JS, CSS, images...)
app.use(express.static(buildPath));

// 3. Pour toutes les autres requêtes (GET), renvoyer le fichier index.html du frontend.
// C'est ce qui permet à React Router de gérer la navigation.
app.get('*_backend', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});


// --- Démarrage du serveur ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
