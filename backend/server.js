require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authMiddleware = require("./middleware/auth");
const { loadDamagesData } = require("./services/damagesService");

const app = express();

app.set("trust proxy", 1);

// CORS : nécessaire pour le front Netlify (preflight OPTIONS + POST)
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);
app.use(express.json());

// Connexion MongoDB (timeout plus long : cold start Atlas / Render gratuit)
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

// Routes protégées par authentification
app.use("/api/dossiers", authMiddleware, require("./routes/dossiers"));

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server en écoute sur le port ${PORT}`);
});
