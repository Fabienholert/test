require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1); // Nécessaire pour express-rate-limit derrière un proxy (Render, etc.)

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
async function connectDB() {
  try {
    let uri = process.env.MONGO_URI;

    // Log de diagnostic (affiche les clés dispo, pas les valeurs)
    console.log(
      "🔍 Clés d'environnement disponibles:",
      Object.keys(process.env).filter(
        (k) => !k.includes("SECRET") && !k.includes("PASS"),
      ),
    );

    if (!uri) {
      console.error(
        "❌ ERREUR CRITIQUE: La variable MONGO_URI est undefined.",
      );
      console.log("Vérifiez votre fichier .env ou l'onglet 'Environment' dans le dashboard Render.");
      process.exit(1);
    }

    // Utilisation de MongoDB en mémoire uniquement pour le développement local pur si explicitement défini
    if (uri && uri.includes("localhost") && process.env.NODE_ENV !== "production") {
      console.log(
        "Démarrage de MongoDB en mémoire pour le développement local...",
      );
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    // Gestion des événements de connexion Mongoose pour la résilience
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connecté à MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose erreur de connexion:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose déconnecté. Tentative de reconnexion...');
    });

    // Options optimisées pour production (Render) et Atlas
    const mongooseOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Limite le nombre de connexions pour la version gratuite Render/Atlas
      minPoolSize: 2,
      family: 4 // Force IPv4, évite des problèmes DNS potentiels sur certains environnements
    };

    await mongoose.connect(uri, mongooseOptions);

    // Créer les indices (uniquement pour Dossier, User n'est plus utilisé)
    const Dossier = require("./models/Dossier");
    await Dossier.collection.createIndex({ numero: 1 }, { unique: true });
    await Dossier.collection.createIndex({ marque: 1 });
    await Dossier.collection.createIndex({ statut: 1 });
    await Dossier.collection.createIndex({ dateCreation: -1 });
    console.log("✅ Indices MongoDB vérifiés/créés");
  } catch (err) {
    console.error("❌ Erreur de connexion à MongoDB (Fatal):", err);
    process.exit(1);
  }
}
connectDB();

// ========== ROUTES API (Authentification désactivée) ==========
const dossiersRouter = require("./routes/dossiers");
const referencesRouter = require("./routes/references");

app.use("/api/dossiers", dossiersRouter);
app.use("/api/references", referencesRouter);

// Health check pour Render
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isHealthy = dbState === 1 || dbState === 2;
  
  if (isHealthy) {
    res.status(200).json({ status: "OK", timestamp: new Date(), dbState });
  } else {
    res.status(503).json({ status: "ERROR", message: "Database disconnected", dbState, timestamp: new Date() });
  }
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
