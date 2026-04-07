# 📦 Guide d'Installation - Audit Garantie VW

## ⚙️ Prérequis

Votre système doit avoir **Node.js** installé pour exécuter cette application React.

## 🔧 Installation de Node.js

### Option 1 : Installation via Homebrew (Recommandé sur macOS)

Si Homebrew n'est pas installé, installez-le d'abord :

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Puis installez Node.js :

```bash
brew install node
```

### Option 2 : Téléchargement Direct

1. Accédez à [nodejs.org](https://nodejs.org)
2. Téléchargez la version **LTS** (recommandée)
3. Exécutez l'installateur et suivez les instructions

### Option 3 : Utiliser nvm (Node Version Manager)

Installez d'abord nvm :

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Puis installez Node.js :

```bash
nvm install 18
nvm use 18
```

## ✅ Vérification de l'Installation

Après installation, vérifiez que tout fonctionne :

```bash
node --version    # Doit afficher v18.x.x ou supérieur
npm --version     # Doit afficher 8.x.x ou supérieur
```

## 🚀 Lancer l'Application

### Étape 1 : Naviguer dans le dossier du projet

```bash
cd "/Users/fabienholert/Desktop/developpemen t/Fabienholert"
```

### Étape 2 : Installer les dépendances

```bash
npm install
```

Cela va installer :

- ✓ React 18
- ✓ Vite
- ✓ Tailwind CSS
- ✓ date-fns

### Étape 3 : Démarrer le serveur de développement

```bash
npm run dev
```

L'application s'ouvrira automatiquement sur `http://localhost:5173`

## 🏗️ Build pour Production

Pour créer une version optimisée pour la production :

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`

## 📋 Commandes Disponibles

| Commande          | Description                                |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Démarrer le serveur de développement       |
| `npm run build`   | Créer la version de production             |
| `npm run preview` | Prévisualiser la build production en local |
| `npm run lint`    | Analyser le code pour les erreurs          |

## 🐛 Dépannage

### "npm: command not found"

→ Node.js n'est pas installé ou pas dans le PATH
→ Réinstallez via Homebrew ou node direct (voir ci-dessus)

### "ERR! Max retries exceeded"

→ Essayez de nettoyer le cache npm :

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 déjà utilisé

→ Changez le port dans `vite.config.js` :

```javascript
server: {
  port: 5174,  // Ou un autre port libre
  open: true
}
```

### Erreur "EACCES: permission denied"

→ Sur macOS/Linux, essayez :

```bash
sudo npm install -g npm
```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez que Node.js v16+ est installé
2. Assurez-vous d'être dans le bon dossier
3. Supprimez `node_modules` et `package-lock.json`, puis réinstallez
4. Videz le cache du navigateur

## 🎉 Prêt à démarrer !

Une fois que vous avez suivi ces étapes, votre application devrait fonctionner !

```bash
cd "/Users/fabienholert/Desktop/developpemen t/Fabienholert" && npm install && npm run dev
```

La commande ci-dessus fait tout en une seule ligne.
