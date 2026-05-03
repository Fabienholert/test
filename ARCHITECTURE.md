# 🎯 Architecture & Bonnes Pratiques

## 📐 Architecture Générale

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend React                        │
│  • Lazy Loading (Dashboard, Dossiers, Details)          │
│  • OCR Client → API Serveur                             │
│  • Bundle optimisé (-70%)                               │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/HTTPS
    ┌──────────────▼──────────────┐
    │    Backend Express.js        │
    │  • Compression Gzip          │
    │  • Rate Limiting             │
    │  • Validation stricte        │
    │  • Pagination               │
    │  • OCR Tesseract            │
    └──────────────┬──────────────┘
                   │ TCP
    ┌──────────────▼──────────────┐
    │      MongoDB                 │
    │  • Indices optimisés         │
    │  • Requêtes lean()          │
    │  • Pagination native        │
    └──────────────────────────────┘
```

## 🔄 Flow Données

### 1️⃣ Upload & OCR

```
Client: File (PDF)
    ↓
POST /api/dossiers/analyze
    ↓
Backend: Multer + UUID naming
    ↓
Backend: Tesseract OCR extraction
    ↓
Response: { numero, vin, marque, ... }
    ↓
Client: Auto-fill form
```

### 2️⃣ Récupération Dossiers

```
Client: GET /api/dossiers?page=1&limit=20
    ↓
Backend: MongoDB query avec indices
    ↓
Backend: Lean() + Projection
    ↓
Response: { data: [...], pagination: {...} }
    ↓
Client: Pagination UI
```

---

## ✅ Checklist Performance

### Backend

- [x] Compression gzip activée
- [x] Helmet.js pour headers sécurité
- [x] Rate limiting actif
- [x] Indices MongoDB créés
- [x] Requêtes `.lean()`
- [x] Pagination implémentée
- [x] Error handling global
- [x] Graceful shutdown

### Frontend

- [x] Code splitting avec lazy loading
- [x] Tesseract supprimé
- [x] Dépendances optimisées
- [x] Bundle final < 1MB
- [x] No console.log en production

### Sécurité

- [x] CORS stricte
- [x] NoSQL injection protection
- [x] Validation fichiers
- [x] JWT authentication
- [x] Rate limiting
- [x] Password bcrypt
- [x] Helmet headers

---

## 🚨 Pièges à Éviter

### ❌ Ne PAS faire

```javascript
// ❌ Retourner TOUS les documents
router.get("/", async (req, res) => {
  const docs = await Model.find(); // SLOW!
  res.json(docs);
});

// ❌ Requête avec beaucoup de champs inutiles
const user = await User.findById(id); // Récupère __v, timestamps, etc

// ❌ OCR côté client
import { createWorker } from "tesseract.js"; // 15MB! SLOW!
const result = await performClientSideOCR(file);

// ❌ Accepter tous les types de fichiers
multer({ fileFilter: null }); // Security issue!

// ❌ Pas d'error handling
app.get("/api/data", async (req, res) => {
  const data = await Model.find(); // Peut crash!
  res.json(data);
});

// ❌ Pas de validation
app.post("/api/create", (req, res) => {
  const item = new Model(req.body); // Données invalides!
  item.save();
});
```

### ✅ À faire

```javascript
// ✅ Pagination + Lean
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  const total = await Model.countDocuments(filter);
  const data = await Model.find(filter)
    .select("field1 field2 field3") // Seulement champs nécessaires
    .sort("-createdAt")
    .limit(limit)
    .skip(skip)
    .lean(); // Important!

  res.json({ data, pagination: { page, limit, total } });
});

// ✅ OCR serveur
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  const buffer = fs.readFileSync(req.file.path);
  const result = await extractDataFromPDF(buffer); // Serveur
  res.json(result);
});

// ✅ Validation stricte
const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "application/vnd.ms-excel"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Type non autorisé"));
  }
};

// ✅ Error handling
app.get("/api/data", async (req, res) => {
  try {
    const data = await Model.find().lean();
    res.json(data);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: err.message });
  }
});
```

---

## 📈 Monitoring & Logs

### Logs Structurés

```javascript
console.log("✅ Connexion à MongoDB réussie !");
console.log("🚀 Serveur démarré sur le port 5000");
console.log("❌ Erreur:", error.message);
```

### Health Check

```bash
curl http://localhost:5000/api/health
# { "status": "OK", "timestamp": "2024-05-03T..." }
```

---

## 🔧 Maintenance

### Mise à jour npm

```bash
# Voir les mises à jour disponibles
npm outdated

# Mettre à jour mineur
npm update

# Mettre à jour majeur (careful!)
npm install package@latest
```

### Nettoyage

```bash
# Supprimer node_modules
rm -rf node_modules package-lock.json

# Réinstaller
npm install
```

### Logs MongoDB

```bash
# Voir les connexions
db.currentOp()

# Statistiques
db.stats()
```

---

## 🚀 Scaling Future

### Si > 1000 dossiers/jour

1. Ajouter Redis pour caching
2. Implémenter job queue (Bull)
3. Sharding MongoDB

### Si > 100k utilisateurs

1. CDN pour uploads
2. Load balancer (Nginx)
3. Réplica set MongoDB
4. Monitoring (Sentry)

### Si besoin haute disponibilité

1. Kubernetes
2. Disaster recovery
3. Multi-region
4. Backup automatique

---

## 📚 Ressources

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Performance](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [React Performance](https://react.dev/reference/react/lazy)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)

---

## 🎓 Apprentissage

Concepts clés implémentés :

- ✅ Compression HTTP
- ✅ Caching & ETags
- ✅ Pagination
- ✅ Lazy loading
- ✅ Code splitting
- ✅ Security headers
- ✅ Rate limiting
- ✅ Database indexing
- ✅ Lean queries
- ✅ Error handling
- ✅ Graceful shutdown
- ✅ Form validation
