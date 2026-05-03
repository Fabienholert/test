require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const app = express();

// ========== MIDDLEWARES DE SÉCURITÉ & OPTIMISATION ==========
// Compression gzip pour tous les fichiers > 1KB
app.use(compression());

// Helmet pour les en-têtes de sécurité
app.use(helmet());

// Rate limiting - éviter les abusages
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite 100 requêtes par IP
  message: "Trop de requêtes, réessayez plus tard",
});
app.use("/api/", limiter);

// CORS optimisé
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  }),
);

// Parsing JSON & sanitisation
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(mongoSanitize()); // Protection NoSQL injection

// ========== CONNEXION MONGODB OPTIMISÉE ==========
const { MongoMemoryServer } = require("mongodb-memory-server");

async function connectDB() {
  try {
    let uri = process.env.MONGO_URI;
    if (uri && uri.includes("localhost")) {
      console.log(
        "Démarrage de MongoDB en mémoire pour le développement local...",
      );
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    // Options optimisées
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ Connexion à MongoDB réussie !");

    // Créer les indices
    const Dossier = require("./models/Dossier");
    const User = require("./models/User");
    await Dossier.collection.createIndex({ numero: 1 }, { unique: true });
    await Dossier.collection.createIndex({ marque: 1 });
    await Dossier.collection.createIndex({ statut: 1 });
    await Dossier.collection.createIndex({ dateCreation: -1 });
    await User.collection.createIndex({ email: 1 }, { unique: true });
    console.log("✅ Indices MongoDB créés");
  } catch (err) {
    console.error("❌ Erreur de connexion à MongoDB:", err);
    process.exit(1);
  }
}
connectDB();

// ========== ROUTES API ==========
const dossiersRouter = require("./routes/dossiers");
const usersRouter = require("./routes/users");
const referencesRouter = require("./routes/references");

app.use("/api/dossiers", dossiersRouter);
app.use("/api/users", usersRouter);
app.use("/api/references", referencesRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// ========== SERVIR LE FRONTEND EN PRODUCTION ==========
const buildPath = path.resolve(__dirname, "..", "client", "build");

// Cache statique optimisé (1 an pour les fichiers avec hash)
app.use(
  express.static(buildPath, {
    maxAge: "1y",
    etag: false,
  }),
);

// Uploads avec cache court
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "7d",
  }),
);

// Fallback pour toutes les autres routes non-API -> servir l'app React
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// ========== GESTION DES ERREURS ==========
app.use((err, req, res, next) => {
  console.error("Erreur:", err);
  res.status(err.status || 500).json({
    message: err.message || "Erreur serveur",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ========== DÉMARRAGE DU SERVEUR ==========
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📋 Environnement: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM reçu, arrêt du serveur...");
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
