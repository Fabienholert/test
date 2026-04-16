
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path"); // Importer le module path
const { loadDamagesData } = require("./services/damagesService");

const app = express();

app.set("trust proxy", 1);

// Konfiguration CORS pour le débogage - AUTORISE TOUT
app.use(
  cors({
    origin: "*", // ATTENTION: Temporaire pour le débogage
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Servir les fichiers statiques du front-end
// __dirname est 'backend', donc on remonte d'un niveau pour trouver 'dist'
app.use(express.static(path.join(__dirname, '../dist')));


// Routes API
app.use("/api/users", require("./routes/users"));
app.use("/api/dossiers", require("./routes/dossiers")); // Protégé au niveau du routeur
app.use("/api/damages", require("./routes/damages")); // Non protégé


// La route "catch-all" pour servir l'application React
// Doit être APRES les routes API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});


// Connexion à MongoDB et démarrage du serveur
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connecté à MongoDB");
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      // Charger les données de défaillances au démarrage
      loadDamagesData();
    });
  })
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB :", err);
    process.exit(1);
  });
