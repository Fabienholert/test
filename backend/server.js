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
  "http://localhost:3000",             // Votre environnement de développement local
  "http://localhost:5173"              // Environnement Vite par défaut
];

// Configuration CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Autoriser les requêtes sans origine (comme les requêtes de serveur à serveur ou les outils comme Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "La politique CORS pour ce site n'autorise pas l'accès depuis cette origine.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Important si vous utilisez des sessions ou des cookies
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json());

// Connexion MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 20000,
  })
  .then(() => {
    console.log("✓ MongoDB connecté");
    loadDamagesData();
  })
  .catch((err) => {
    console.error("✗ Erreur MongoDB:", err.message);
    process.exit(1);
  });

// Routes publiques
app.use("/api/auth", require("./routes/auth"));
app.use("/api/damages", require("./routes/damages"));

// Health check (public)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Routes protégées
app.use("/api/dossiers", authMiddleware, require("./routes/dossiers"));

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server en écoute sur le port ${PORT}`);
});
