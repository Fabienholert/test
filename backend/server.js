
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { loadDamagesData } = require("./services/damagesService");

const app = express();

// Middlewares
app.set("trust proxy", 1);
app.use(cors({ origin: "*" }));
app.use(express.json());

// ===== ROUTES API =====
const apiRouter = express.Router();
apiRouter.use("/users", require("./routes/users"));
apiRouter.use("/dossiers", require("./routes/dossiers"));
apiRouter.use("/damages", require("./routes/damages"));

// Préfixer toutes les routes API avec /api
app.use("/api", apiRouter);

// ===== SERVICE DU FRONTEND REACT =====
// Servir les fichiers statiques (CSS, JS, images) depuis le dossier dist
app.use(express.static(path.join(__dirname, "../dist")));

// Pour toute autre requête GET non-API, renvoyer l'index.html de React
// Cela permet au routage côté client de React de fonctionner.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});

// ===== DÉMARRAGE DU SERVEUR =====
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connecté à MongoDB");
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      loadDamagesData();
    });
  })
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB :", err);
    process.exit(1);
  });
