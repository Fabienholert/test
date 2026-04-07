# 🔐 Guide Authentification - Audit Garantie VW

## Vue d'ensemble

Votre application est maintenant sécurisée avec un système d'authentification basé sur **JWT (JSON Web Tokens)**.

## 🔑 Comptes pré-créés

Deux comptes utilisateurs ont été créés pour vous permettre de tester :

### Compte Technicien
- **Email** : `technicien@vw.com`
- **Mot de passe** : `Technicien123!`
- **Accès** : Consultation et création de dossiers

### Compte Manager
- **Email** : `manager@vw.com`
- **Mot de passe** : `Manager123!`
- **Accès** : Consultation et création de dossiers

## 🔄 Flow d'authentification

```
1. Utilisateur accède à l'application
   ↓
2. Page de login s'affiche (si non connecté)
   ↓
3. Utilisateur entre email + mot de passe
   ↓
4. Requête POST /api/auth/login
   ↓
5. Backend valide les identifiants
   ↓
6. Backend retourne un JWT token
   ↓
7. Frontend sauvegarde le token dans localStorage
   ↓
8. Accès aux routes protégées (/api/dossiers)
   ↓
9. Token envoyé dans le header Authorization
```

## 🛡️ Sécurité

### Frontend
- Le token JWT est stocké dans `localStorage`
- Le token est automatiquement envoyé à chaque requête API
- En cas de token expiré (401), redirection automat vers login

### Backend
- Middleware d'authentification sur toutes les routes `/api/dossiers`
- Validation du JWT sur chaque requête protégée
- Passwords stockés hashés avec bcrypt (jamais en clair)
- Tokens valables 24 heures

## 📝 Routes d'authentification

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "technicien@vw.com",
  "password": "Technicien123!"
}

Réponse (200):
{
  "message": "Connexion réussie",
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "technicien@vw.com",
    "nom": "Dupont",
    "prenom": "Jean"
  }
}
```

### Register (créer nouvel utilisateur)
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "nouveau@vw.com",
  "password": "MotDePasse123!",
  "nom": "Dupont",
  "prenom": "Jean"
}
```

### Obtenir ses infos
```bash
GET /api/auth/me
Authorization: Bearer <token>

Réponse:
{
  "_id": "...",
  "email": "technicien@vw.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "createdAt": "2026-04-07T..."
}
```

## 🔒 Routes protégées

Toutes les routes dossiers nécessitent le JWT token :

```bash
GET /api/dossiers
Authorization: Bearer eyJhbGci...
```

## 🖥️ Utilisation depuis le frontend

### Le service dossierAPI gère automatiquement :
```javascript
// Récupère le token depuis localStorage
// Ajoute le header Authorization automatiquement
// Renouvelle le login si token expiré (401)

const dossiers = await dossierAPI.getAll()
```

### Gestion du login
```javascript
// Page de login s'affiche si pas de token
if (!localStorage.getItem('token')) {
  // Afficher LoginPage
}

// Après le login
localStorage.setItem('token', response.token)
localStorage.setItem('user', JSON.stringify(response.user))

// Déconnexion
localStorage.removeItem('token')
localStorage.removeItem('user')
```

## 🔧 Créer un nouvel utilisateur (backend)

### Option 1 : Via l'API (à partir de l'app)
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nouveau@vw.com",
    "password": "SecurePass123!",
    "nom": "Dupont",
    "prenom": "Jean"
  }'
```

### Option 2 : Via Node.js (script)
```bash
cd backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = new User({
    email: 'nouveau@vw.com',
    password: 'SecurePass123!',
    nom: 'Dupont',
    prenom: 'Jean'
  });
  await user.save();
  console.log('Utilisateur créé');
  await mongoose.disconnect();
})();
"
```

## 🔐 Changer la clé secrète JWT

### En production, CHANGEZ obligatoirement :
Modifiez dans `/backend/.env` :
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

Générez une clé forte :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Architecture

```
App.jsx
├── isAuthenticated (state)
├── user (state)
│
├── LoginPage (si non authentifié)
│   └── Envoie email + password à /api/auth/login
│
└── Application principale (si authentifié)
    ├── Header avec infos utilisateur
    ├── Sections (Conformance, Capture, Tracking)
    └── Tous les appels API incluent le JWT token
```

## 🆘 Dépannage

### "Token invalide ou expiré"
- ✓ Vérifiez que le token n'a pas expiré (24h)
- ✓ Connectez-vous à nouveau

### "401 Unauthorized"
- ✓ Le token JWT n'a pas été envoyé
- ✓ Vérifiez localStorage contient le token
- ✓ Rafraîchissez la page et reconnectez-vous

### "Email ou password incorrect"
- ✓ Vérifiez vos identifiants
- ✓ Les passwords sont sensibles à la casse
- ✓ Utilisez format email complet (ex: technicien@vw.com)

## 📦 Variables d'environnement

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/...
PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5001/api
```

## 🚀 Prochaines étapes

1. ✓ Testez le login avec les 2 comptes fournis
2. ✓ Créez de nouveaux utilisateurs si nécessaire
3. Pour la production:
   - Changez la JWT_SECRET
   - Modifiez VITE_API_URL vers votre serveur production
   - Déployez backend et frontend
