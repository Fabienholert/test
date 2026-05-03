# 🚀 PREMIER DÉMARRAGE - Checklist

Après avoir cloner et installé le projet, suivre ces étapes :

## ✅ Avant de Lancer

### 1. Configuration de base

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer .env (vs code / nano / vim)
code .env
```

### 2. Installer les dépendances

```bash
# Depuis la racine du projet
npm install

# Cela installe automatiquement :
# - backend/node_modules
# - client/node_modules
```

### 3. Configurer MongoDB

**Option A : Local (Development)**

```bash
# Mac avec Homebrew
brew install mongodb-community
brew services start mongodb-community

# Vérifier
mongosh
> db.version()  # Doit afficher la version
```

**Option B : MongoDB Atlas (Cloud)**

```
1. Aller à https://www.mongodb.com/cloud/atlas
2. Créer account gratuit
3. Créer cluster (M0 gratuit)
4. Copier connection string
5. Mettre dans .env : MONGO_URI=mongodb+srv://...
```

### 4. Vérifier la structure

```bash
# Vérifier que les fichiers existent
ls -la backend/server.js
ls -la client/src/App.js
ls -la .env
```

---

## 🎯 Démarrer pour la Première Fois

### Option 1 : Développement (Recommandé)

```bash
# Depuis la racine
npm run dev

# Cela lance :
# Terminal 1: Backend sur http://localhost:5000
# Terminal 2: Frontend sur http://localhost:3000
# (Ouverture auto du navigateur)

# Logs à surveiller :
# ✅ "Connexion à MongoDB réussie !"
# ✅ "Serveur démarré sur le port 5000"
# ✅ "webpack compiled successfully"
```

### Option 2 : Production

```bash
# Build le frontend
npm run build

# Démarrer le serveur
npm start

# Backend sur http://localhost:5000
# Frontend servi depuis /build
```

---

## 🔍 Vérifier que tout Fonctionne

### Terminal 1 : Backend

```bash
cd backend && npm run dev

# Attendez :
# ✅ "Connexion à MongoDB réussie !"
# ✅ "Indices MongoDB créés"
# ✅ "Serveur démarré sur le port 5000"
```

### Terminal 2 : Frontend

```bash
cd client && npm start

# Attendez :
# ✅ "webpack compiled successfully"
# 🌐 Navigateur s'ouvre sur http://localhost:3000
```

### Navigateur

```
1. Aller à http://localhost:3000
2. Voir la page de login (ou dashboard)
3. Tester les features (upload, OCR, pagination)
```

### Test API

```bash
# Dans un 3ème terminal
curl http://localhost:5000/api/health
# Réponse : {"status":"OK","timestamp":"..."}

# Lister les dossiers (vides au démarrage)
curl http://localhost:5000/api/dossiers
# Réponse : {"data":[],"pagination":{...}}
```

---

## ⚠️ Erreurs Courantes & Solutions

### "ECONNREFUSED MongoDB"

```
❌ Erreur: connect ECONNREFUSED 127.0.0.1:27017

✅ Solution:
# Vérifier MongoDB lancé
brew services list | grep mongodb

# Sinon lancer
brew services start mongodb-community

# Ou changer .env vers Atlas
MONGO_URI=mongodb+srv://user:pass@...
```

### "Port 5000 en utilisation"

```
❌ Erreur: listen EADDRINUSE :::5000

✅ Solution 1:
# Changer le port dans .env
PORT=5001

✅ Solution 2:
# Tuer le process
lsof -ti:5000 | xargs kill -9
```

### "Port 3000 en utilisation"

```
❌ Erreur lors du npm start du client

✅ Solution:
# Le port 3000 se change automatiquement
# Mais si vous voulez le forcer:
PORT=3001 npm start
```

### "Module not found: tesseract.js"

```
❌ Erreur: Cannot find module 'tesseract.js'

✅ Solution:
# Ce module NE doit PAS être dans client/
# Réinstaller le client
cd client && rm -rf node_modules
cd client && npm install
# Tesseract n'est que dans backend
```

### "OCR très lent"

```
❌ OCR prend > 10 secondes

✅ Normal si:
- Premier appel OCR (Tesseract s'initialise)
- Gros PDF (> 20 pages)
- Serveur faible

✅ Vérifier logs:
npm run dev  # Voir les logs de Tesseract
```

### "Fichier upload échoue"

```
❌ Erreur: 500 Internal Server Error

✅ Vérifier:
1. Fichier est PDF/XLS (pas Word/Image)
2. Fichier < 50MB
3. Dossier /uploads existe
   mkdir -p backend/uploads

✅ Voir les logs précis du backend
```

---

## 📊 Structure des Données MongoDB

### Au premier démarrage

```javascript
// Collections créées automatiquement :
// - dossiers  (Dossier.js schema)
// - users     (User.js schema)
// - sessions  (JWT si applicable)

// Indices créés automatiquement :
// - numero (unique)
// - marque
// - statut
// - dateCreation
// - email (users)
```

### Test données

```bash
# Vérifier les collections
mongosh

> use audit-garantie-vw
> db.dossiers.find().limit(5)  # Voir les dossiers
> db.users.find()               # Voir les utilisateurs
> db.dossiers.getIndexes()      # Voir les indices
```

---

## 🎨 Accès aux Pages

| Page      | URL                                | Description           |
| --------- | ---------------------------------- | --------------------- |
| Login     | http://localhost:3000/login        | Connexion utilisateur |
| Dashboard | http://localhost:3000/             | Vue d'ensemble        |
| Dossiers  | http://localhost:3000/dossiers     | Liste des dossiers    |
| Détail    | http://localhost:3000/dossiers/:id | Détail dossier        |

---

## 🧪 Test Features

### 1. Upload & OCR

```
1. Aller à /dossiers → "Nouveau Dossier"
2. Uploader un PDF de test
3. Attendre 2-5s (OCR Tesseract)
4. Voir les champs auto-remplis
5. Compléter le formulaire
6. Cliquer "Créer"
```

### 2. Pagination

```
1. Aller à /dossiers
2. Voir "Page 1 of X"
3. Cliquer "Suivant"
4. Vérifier changement de page
```

### 3. Filtres

```
1. /dossiers?marque=Volkswagen
2. /dossiers?statut=En%20cours
3. /dossiers?page=2&limit=50
```

### 4. Compression Gzip

```bash
# Vérifier les réponses comprimées
curl -i http://localhost:5000/api/dossiers | head
# Voir: Content-Encoding: gzip
```

---

## 📚 Documentation

Après le démarrage, consulter :

1. **OPTIMIZATIONS.md** - Détail des optimisations (OBLIGATOIRE)
2. **ARCHITECTURE.md** - Architecture et bonnes pratiques
3. **INSTALLATION.md** - Guide complet d'installation
4. **backend/routes/dossiers.js** - Code exemple optimisé

---

## 🎓 Prochaines Étapes

1. **Comprendre les optimisations** → Lire OPTIMIZATIONS.md
2. **Modifier le code** → Respecter les patterns de ARCHITECTURE.md
3. **Déployer** → Suivre le guide Render dans INSTALLATION.md
4. **Scaler** → Voir section Scaling dans ARCHITECTURE.md

---

## ✨ Vous êtes Prêt !

L'application est complètement optimisée et prête pour :

- ✅ Développement rapide
- ✅ Production
- ✅ Scaling

Happy coding! 🚀

Questions ? Vérifier les fichiers .md du projet !
