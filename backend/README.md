# 🚀 Backend API - Audit Garantie VW

API REST complète pour gérer les ordres de réparation avec persistance en base de données.

---

## 📋 Contenu

- **server.js** : Serveur Express principal
- **models/Dossier.js** : Schéma MongoDB pour les dossiers
- **routes/dossiers.js** : Routes API CRUD
- **package.json** : Dépendances Node.js
- **.env.example** : Modèle de configuration

---

## 🔧 Installation Locale

### 1️⃣ Installer les Dépendances

```bash
cd backend
npm install
```

### 2️⃣ Configurer MongoDB

**Option A : MongoDB Atlas (Cloud - Recommandé)**

1. Allez sur https://www.mongodb.com/cloud/atlas
2. Créez un compte gratuit
3. Créez un cluster gratuit
4. Allez dans "Database" → "Collections"
5. Créez une base : `audit-garantie-vw`
6. Allez dans "Database Access" et créez un utilisateur
7. Allez dans "Network Access" et acceptez votre IP
8. Cliquez "Connect" et copiez la connection string

**Option B : MongoDB Local**

```bash
brew install mongodb-community
brew services start mongodb-community
# Connection: mongodb://localhost:27017/audit-garantie-vw
```

### 3️⃣ Créer le Fichier .env

```bash
cp .env.example .env
```

Modifiez `.env` et entrez votre connection string MongoDB :

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/audit-garantie-vw
PORT=5000
```

### 4️⃣ Lancer le Serveur

```bash
# Mode développement (avec rechargement auto)
npm run dev

# Ou mode production
npm start
```

Vous verrez :

```
✓ MongoDB connecté
🚀 Server en écoute sur le port 5000
```

---

## 📡 API Endpoints

### **GET /api/dossiers**

Récupérer tous les dossiers

```bash
curl http://localhost:5000/api/dossiers
```

### **GET /api/dossiers/:id**

Récupérer un dossier par ID

```bash
curl http://localhost:5000/api/dossiers/123abc
```

### **POST /api/dossiers**

Créer un nouveau dossier

```bash
curl -X POST http://localhost:5000/api/dossiers \
  -H "Content-Type: application/json" \
  -d '{...dossier data...}'
```

### **PUT /api/dossiers/:id**

Mettre à jour un dossier

```bash
curl -X PUT http://localhost:5000/api/dossiers/123abc \
  -H "Content-Type: application/json" \
  -d '{...updated data...}'
```

### **DELETE /api/dossiers/:id**

Supprimer un dossier

```bash
curl -X DELETE http://localhost:5000/api/dossiers/123abc
```

### **GET /api/dossiers/stats/overview**

Récupérer les statistiques

```bash
curl http://localhost:5000/api/dossiers/stats/overview
```

---

## 🗄️ Schéma Dossier

```javascript
{
  // Section A - Conformité
  reclamation: "Oui" | "Non",
  signature: "Oui" | "Non",
  dateEntree: Date,
  dateImpression: Date,

  // Section B - Saisie
  orNumber: String (unique),
  dissNumber: String,
  vin: String,
  model: String,
  km: String,
  technicien: String,
  pointageAtelier: String,
  codeDommage: String,
  codeAvarie: String,
  dissOpen: "Oui" | "Non",
  protocole: "Oui" | "Non",
  ppso: "Oui" | "Non",
  fichePedagogique: String,
  tpi: String,
  dateDiag: Date,
  sortiepromise: Date,

  // Metadata
  docsOK: Boolean (calculé auto),
  statut: "validé" | "en attente" | "rejeté",
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Déployer le Backend

### **Option 1 : Heroku (Recommandé)**

```bash
# Installer Heroku CLI
brew tap heroku/brew && brew install heroku

# Connexion
heroku login

# Créer l'app
heroku create audit-garantie-vw-api

# Ajouter la variable d'environnement
heroku config:set MONGODB_URI="votre_connection_string"

# Déployer
git push heroku main

# Voir les logs
heroku logs --tail
```

Votre API sera sur : `https://audit-garantie-vw-api.herokuapp.com/api/dossiers`

### **Option 2 : Render (Plus facile)**

1. Allez sur https://render.com
2. Créez un compte
3. Cliquez "New +" → "Web Service"
4. Connectez votre GitHub et sélectionnez le repo
5. Remplissez le formulaire :
   - **Name** : `audit-garantie-vw-api`
   - **Start command** : `npm start`
   - **Environment variable** : `MONGODB_URI=...`
6. Cliquez "Create Web Service"

Votre API sera en ligne !

### **Option 3 : Railway**

1. Allez sur https://railway.app
2. Connectez GitHub
3. Importez le repo
4. Ajouter la variable `MONGODB_URI`
5. Deploy !

---

## 🔗 Connecter le Frontend

### **Variables d'Environnement (Frontend)**

Créez `.env` dans le dossier racine (frontend) :

```
REACT_APP_API_URL=https://audit-garantie-vw-api.herokuapp.com/api
```

Ou en développement local :

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🧪 Tester l'API

### Avec Postman

1. Téléchargez Postman : https://postman.com
2. Crée une nouvelle collection
3. Testez les endpoints :
   - **GET** `http://localhost:5000/api/dossiers`
   - **POST** avec le body JSON
   - etc.

### Avec cURL

```bash
# Lister les dossiers
curl http://localhost:5000/api/dossiers

# Créer un dossier
curl -X POST http://localhost:5000/api/dossiers \
  -H "Content-Type: application/json" \
  -d '{"orNumber":"OR-001","dissNumber":"D001",...}'
```

---

## 🐛 Dépannage

### "MongoDB connecté" ne s'affiche pas

- Vérifiez la connection string dans `.env`
- Vérifiez que MongoDB est en ligne
- Vérifiez votre IP dans MongoDB Atlas

### CORS Error depuis le Frontend

- Assurez-vous que `REACT_APP_API_URL` est correct
- Le serveur Express accept déjà CORS

### Port 5000 déjà utilisé

```bash
# Changer le port dans .env
PORT=5001
```

---

## 📚 Dépendances

- **express** : Framework web
- **cors** : Gestion CORS
- **mongoose** : ODM MongoDB
- **dotenv** : Variables d'environnement
- **nodemon** : Rechargement auto (dev)

---

## 🔐 Sécurité (À Implémenter Niveau v0.2.0)

- ⚠️ Authentification JWT manquante
- ⚠️ Validation input manquante
- ⚠️ Rate limiting manquant
- ⚠️ Encryption manquante

À ajouter bientôt !

---

## 📞 Support

Besoin d'aide ?

- Lire les lire les erreurs en console
- Vérifier les logs : `heroku logs --tail` ou console Render
- Tester l'API avec cURL

---

**Backend prêt à l'emploi !** 🚀
