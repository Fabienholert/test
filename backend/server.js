
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
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

// Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/dossiers", require("./routes/dossiers")); // Protégé au niveau du routeur
app.use("/api/damages", require("./routes/damages")); // Non protégé

// Route de test
app.get("/", (req, res) => {
  res.send("API Audit Garantie VW - En cours d'exécution");
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
