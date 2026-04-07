# 🚀 Guide Déploiement GitHub + Web - Audit Garantie VW

Ce guide vous montre comment mettre votre application sur GitHub et la déployer en ligne.

---

## 📋 Table des Matières

1. [Créer un compte GitHub](#créer-un-compte-github)
2. [Créer un repository](#créer-un-repository)
3. [Pousser le code](#pousser-le-code)
4. [Déployer sur Netlify](#déployer-sur-netlify) (RECOMMANDÉ)
5. [Déployer sur Vercel](#déployer-sur-vercel) (Alternative)
6. [Déployer sur GitHub Pages](#déployer-sur-github-pages) (Gratuit)

---

## 🔑 Créer un Compte GitHub

### Si vous n'avez pas de compte

1. Allez sur [github.com](https://github.com)
2. Cliquez **"Sign up"** (en haut à droite)
3. Remplissez le formulaire :
   - Username : Votre pseudo (ex: `fabienholert`)
   - Email : Votre email
   - Password : Mot de passe sécurisé
4. Vérifiez votre email
5. ✓ Compte créé !

### Si vous avez déjà un compte

Connectez-vous directement sur [github.com](https://github.com)

---

## 🏗️ Créer un Repository GitHub

### Étape 1 : Aller sur GitHub

1. Allez sur [github.com/new](https://github.com/new)
2. Ou cliquez le "+" en haut à droite → "New repository"

### Étape 2 : Remplir les Paramètres

**Repository name :**

```
audit-garantie-vw
```

**Description :**

```
Gestion de réception après-vente et audit garantie Volkswagen
```

**Visibility :**

- ✓ Public (pour que ce soit accessible)

**Initialize this repository with :**

- ☐ Add a README.md
- ☐ Add .gitignore
- ☐ Choose a license

(NE COCHEZ PAS, on l'a déjà)

### Étape 3 : Créer le Repository

Cliquez **"Create repository"**

### Étape 4 : Copier l'URL du Repository

Vous verrez une URL comme :

```
https://github.com/VOTRE_USERNAME/audit-garantie-vw.git
```

Copiez-la (vous en aurez besoin)

---

## 📤 Pousser le Code sur GitHub

### Étape 1 : Configurer l'origin

Dans le terminal, dans votre dossier du projet :

```bash
cd "/Users/fabienholert/Desktop/developpemen t/Fabienholert"
```

Remplacez `VOTRE_USERNAME` par votre username GitHub :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/audit-garantie-vw.git
```

### Étape 2 : Vérifier la Branche

```bash
git branch -M main
```

### Étape 3 : Pousser le Code

```bash
git push -u origin main
```

**Première fois** : GitHub vous demandera de vous authentifier

- Choisissez "Authenticate with a password using a personal access token"
- Ou utilisez les clés SSH

### Étape 4 : Vérifier

Allez sur `github.com/VOTRE_USERNAME/audit-garantie-vw`

Vous devriez voir tous vos fichiers en ligne ! ✓

---

## 🌐 Déployer sur Netlify (RECOMMANDÉ)

Netlify est **gratuit**, **rapide** et **facile** pour déployer des apps Vite/React.

### Étape 1 : Se Connecter à Netlify

1. Allez sur [netlify.com](https://netlify.com)
2. Cliquez **"Sign up"**
3. Choisissez **"Sign up with GitHub"**
4. Autorisez Netlify à accéder à GitHub

### Étape 2 : Créer un Site

1. Cliquez **"Add new site"** → **"Import an existing project"**
2. Choisissez **"GitHub"**
3. Cherchez **"audit-garantie-vw"** et sélectionnez-le
4. Cliquez **"Install"** pour autoriser Netlify

### Étape 3 : Configurer le Build

**Netlify détectera automatiquement :**

- Build command : `npm run build`
- Publish directory : `dist`

Cliquez **"Deploy site"**

### Étape 4 : Attendre le Déploiement

- L'app se déploiera automatiquement
- Vous verrez une URL comme : `https://audit-garantie-vw-xxxxx.netlify.app`
- ✓ Allez sur cette URL, votre app est en ligne !

### Étape 5 (Optionnel) : Ajouter un Domaine Personnalisé

1. Dans les paramètres du site Netlify
2. Allez à "Domain management"
3. Cliquez "Add domain"
4. Entrez votre domaine (ex: `audit-garantie-vw.com`)

---

## 🔄 Mettre à Jour le Site (Après Modifications)

Chaque fois que vous modifiez le code :

```bash
git add .
git commit -m "feat: description de la modification"
git push origin main
```

Netlify **redéploiera automatiquement** en ~2 minutes ! 🚀

---

## ⚡ Déployer sur Vercel (Alternative)

Vercel est aussi très populaire pour les apps React/Vite.

### Étape 1 : Se Connecter

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez **"Sign up"**
3. Choisissez **"Continue with GitHub"**

### Étape 2 : Importer le Projet

1. Cliquez **"New Project"**
2. Cherchez **"audit-garantie-vw"**
3. Cliquez **"Import"**

### Étape 3 : Configurer

Les paramètres sont détectés automatiquement :

- Framework : **Vite**
- Build command : `npm run build`
- Output directory : `dist`

Cliquez **"Deploy"**

### Étape 4 : Attendre

Votre app sera en ligne sur une URL Vercel !

---

## 📄 Déployer sur GitHub Pages (Gratuit)

GitHub Pages est _gratuit_ mais moins flexible.

### Étape 1 : Modifier vite.config.js

Ouvrez `vite.config.js` et changez :

```javascript
export default defineConfig({
  plugins: [react()],
  base: "/audit-garantie-vw/", // ← AJOUTER CETTE LIGNE
  server: {
    port: 5173,
    open: true,
  },
});
```

### Étape 2 : Créer un Workflow GitHub Actions

Créez le fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - run: npm install
      - run: npm run build

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Étape 3 : Pousser le Code

```bash
git add .
git commit -m "ci: add GitHub Pages workflow"
git push origin main
```

### Étape 4 : Activer GitHub Pages

1. Allez sur votre repo GitHub
2. Settings → Pages
3. Source : Deploy from a branch
4. Branch : gh-pages → Save

Votre app sera accessible sur :

```
https://VOTRE_USERNAME.github.io/audit-garantie-vw/
```

---

## 🎯 Comparaison des Options

| Plateforme       | Gratuit | Domaine | Speed       | Ease        | Recommandation |
| ---------------- | ------- | ------- | ----------- | ----------- | -------------- |
| **Netlify**      | ✓       | Payant  | Très rapide | Très facile | ⭐ MEILLEUR    |
| **Vercel**       | ✓       | Payant  | Très rapide | Très facile | ⭐ BON         |
| **GitHub Pages** | ✓       | Gratuit | Rapide      | Modéré      | OK             |

**Recommandation : Netlify** (Free, facile, rapide)

---

## 📊 Statut du Déploiement

### Vérifier le Déploiement sur Netlify

1. Allez sur [app.netlify.com](https://app.netlify.com)
2. Allez dans votre site
3. Onglet **"Deploys"** pour voir l'historique
4. Cliquez sur un déploiement pour voir les détails

### Vérifier les Erreurs

Si le déploiement échoue :

1. Cliquez sur l'erreur dans "Deploys"
2. Vérifiez les logs de build
3. Erreurs communes :
   - `npm ERR!` : Problème d'installation
   - `Module not found` : Import manquant
   - `ENOENT` : Fichier manquant

---

## 🔐 Autoriser GitHub à Netlify/Vercel

Première fois que vous déployez :

1. Netlify/Vercel vous demande d'autoriser l'accès à GitHub
2. Cliquez **"Install"** ou **"Authorize"**
3. Vous serez redirigé pour confirmer
4. ✓ Autorisé !

---

## 🌍 Accéder à Votre Site

Une fois déployé sur Netlify :

```
https://audit-garantie-vw-XXXXX.netlify.app
```

Ou avec domaine personnalisé :

```
https://audit-garantie-vw.com
```

Partagez le lien partout !

---

## 📝 Mise à Jour du Code

Chaque fois que vous modifiez le code en local :

```bash
# 1. Faire vos modifications dans VS Code

# 2. Ajouter les fichiers
git add .

# 3. Créer un commit
git commit -m "feat: description de votre changement"

# 4. Pousser sur GitHub
git push origin main
```

**Netlify redéploiera automatiquement** en ~1-2 minutes !

---

## 🚨 Dépannage

### Erreur : "fatal: 'origin' does not appear to be a 'git' repo"

```bash
# Vérifier que vous êtes dans le bon dossier
cd "/Users/fabienholert/Desktop/developpemen t/Fabienholert"

# Ajouter l'origin
git remote add origin https://github.com/VOTRE_USERNAME/audit-garantie-vw.git
```

### Erreur : "Permission denied (publickey)"

Vous devez configurer SSH ou utiliser un token :

```bash
# Utiliser HTTPS à la place
git remote set-url origin https://github.com/VOTRE_USERNAME/audit-garantie-vw.git

# Ou générer un token GitHub
# → GitHub Settings → Developer settings → Personal access tokens
```

### Le Déploiement Échoue

Vérifiez :

1. `npm install` fonctionne en local
2. `npm run build` fonctionne en local
3. Le dossier `dist/` est créé
4. Tous les fichiers sont sur GitHub

### Le Site Affiche "Not Found"

- Vérifiez la branche (`main` ou `master`)
- Vérifiez que le build réussit dans Netlify/Vercel
- Attendez 2-3 minutes après le commit

---

## ✅ Checklist de Déploiement

```
GITHUB
☐ Créé un compte GitHub
☐ Créé un repository "audit-garantie-vw"
☐ Configuré l'origin local
☐ Poussé le code sur GitHub
☐ Vérifié les fichiers sur GitHub

NETLIFY (ou Vercel/GitHub Pages)
☐ Connecté Netlify/GitHub
☐ Importé le repository
☐ Configuré le build
☐ Lancé le déploiement
☐ Reçu l'URL de déploiement
☐ Accédé au site en ligne
☐ Confirmé que l'app fonctionne

MAINTENANCE
☐ Compris comment mettre à jour le site
☐ Configuré les notifications de build (optionnel)
☐ Partagé le lien avec les utilisateurs
```

---

## 📞 Besoin d'Aide ?

### Liens Utiles

- [GitHub Docs](https://docs.github.com)
- [Netlify Docs](https://docs.netlify.com)
- [Vercel Docs](https://vercel.com/docs)
- [Vite Docs](https://vitejs.dev)

### Commandes Importantes

```bash
# Vérifier le statut de Git
git status

# Voir l'historique des commits
git log --oneline

# Voir les remotes configurés
git remote -v

# Changer l'URL remote
git remote set-url origin https://nouveau-url.git
```

---

## 🎉 Vous Avez Terminé !

Votre app **Audit Garantie VW** est maintenant :

- ✓ Stockée sur GitHub
- ✓ Déployée en ligne
- ✓ Accessible au monde entier

Partagez le lien ! 🚗✨

---

**Prochaines étapes :**

1. Configurez un domaine personnalisé (optionnel)
2. Ajoutez des statistiques (Google Analytics)
3. Configurez les notifications de build (email)
4. Continuez à développer des features

Merci d'utiliser Audit Garantie VW !
