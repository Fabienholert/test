
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authMiddleware = require("./middleware/auth");
const { loadDamagesData } = require("./services/damagesService");

const app = express();

app.set("trust proxy", 1);

// Liste des origines autorisées
const allowedOrigins = [
  "https://audit-garantie-vw.web.app", // Votre frontend de production
  "https://test-89930331-b0789.web.app", // URL de test Firebase
  "http://localhost:3000",             // Votre environnement de développement local
  "http://localhost:5173"              // Environnement Vite par défaut
];

// Configuration CORS simplifiée
app.use(
  cors({
    origin: allowedOrigins, // On passe directement le tableau
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", authMiddleware, require("./routes/users"));
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
