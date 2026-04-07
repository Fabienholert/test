# 🚗 Audit Garantie VW - Gestion de Réception

Application React de saisie pour les réceptionnaires automobiles avec système de contrôle de conformité strict pour les audits de garantie Volkswagen.

## 📋 Fonctionnalités Principales

### Section A : Conformité OR (Blocage)
Vérification initiale des critères de conformité obligatoires :
- ✓ Réclamation client (Oui/Non)
- ✓ Signature dossier (Oui/Non)
- ✓ Date d'entrée véhicule
- ✓ Date d'impression OR

**Règles de blocage strictes :**
- Réclamation ET Signature doivent être "Oui"
- Date d'entrée ne peut pas avoir plus de 30 jours
- Date d'impression ne peut pas être postérieure à la date d'entrée

### Section B : Fiche de Saisie Réception
Tous les champs obligatoires pour le dossier technique :

**Saisie libre :**
- OR #, N°DISS, VIN, Modèle, KM, Technicien, Pointage Atelier, Code Dommage, Code Avarie

**Questions Oui/Non :**
- DISS ouvert, Protocole en ligne, PPSO

**Identifiants optionnels :**
- Fiche pédagogique (N° ou "Non")
- TPI (N° ou "Non")

**Dates :**
- Date du Diag
- Sortie Promise

### Section C : Tableau de Suivi
Historique de tous les dossiers validés avec :
- Colonnes principales (OR #, DISS, VIN, Modèle, KM, Technicien)
- Status de conformité (Protocole, PPSO)
- **Colonne "Docs OK"** : Validée si Protocole=Oui ET PPSO=Oui ET Fiche/TPI ne sont pas "Non"
- Dates (Diag, Sortie Promise)
- Statistiques en temps réel

## 🎨 Design

**Utilisation de Tailwind CSS avec couleurs distinctes :**
- 🟠 **Orange** : Section A (Conformité/Blocage)
- 🔵 **Bleu** : Section B (Saisie/Capture)
- 🟢 **Vert** : Section C (Validation/Suivi)

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+
- npm ou yarn

### Installation
```bash
npm install
```

### Démarrage en développement
```bash
npm run dev
```

L'application s'ouvrira automatiquement sur `http://localhost:5173`

### Build pour production
```bash
npm run build
```

## 📦 Dépendances

- **React 18** : Framework UI
- **Vite** : Build tool moderne
- **Tailwind CSS** : Framework CSS utilitaire
- **date-fns** : Manipulation de dates

## 🏗️ Architecture des Composants

```
App.jsx (Composant principal)
├── SectionConformance.jsx (Validation stricte)
├── SectionCapture.jsx (Formulaire technique)
├── SectionTracking.jsx (Tableau de suivi)
└── Composants réutilisables
    ├── InputField.jsx
    ├── SelectField.jsx
    └── DateField.jsx
```

## 🔍 Logique de Validation

1. **Validation Section A (Conformité)**
   - Vérification immédiate du status de conformité
   - Affichage des erreurs de blocage en temps réel
   - Empêche la validation si non conforme

2. **Validation Section B (Saisie)**
   - Tous les champs obligatoires
   - Messages d'erreur détaillés

3. **Calcul automatique "Docs OK"**
   ```javascript
   Docs OK = (Protocole === 'Oui') AND 
             (PPSO === 'Oui') AND 
             (Fiche pédagogique !== 'Non' AND !== '') AND 
             (TPI !== 'Non' AND !== '')
   ```

## 💾 Stockage et Gestion des Données

- Utilisation de **useState** React pour la gestion d'état
- Les données validées sont ajoutées au tableau de suivi
- Les formulaires sont réinitialisés après chaque validation
- Les données restent en mémoire (session courante)

## 🎯 Utilisation

1. **Remplir Section A** : Vérifier la conformité OR
2. **Remplir Section B** : Saisir les données techniques
3. **Cliquer "Valider la Réception"** : Vérifier 100% des champs
4. **Consulter Section C** : Voir le dossier dans le tableau de suivi
5. **Analyser les statistiques** : Suivre le taux de conformité

## 📊 Statistiques Disponibles

- Total de dossiers validés
- Nombre de dossiers avec "Docs OK"
- Nombre de dossiers à revoir
- Taux global de conformité %

## ⚠️ Notes Important

- Le système bloque la validation si les critères de conformité ne sont pas respectés
- Les dates sont validées en temps réel
- Tous les champs de la Section B sont obligatoires
- Les données ne sont stockées qu'en mémoire (session courante)

## 📝 Licence

Propriétaire - Volkswagen Audit Garantie

## 👨‍💻 Développement

Structure du projet :
```
├── src/
│   ├── components/          # Composants React
│   ├── App.jsx             # Application principale
│   ├── index.css           # Styles Tailwind
│   └── main.jsx            # Point d'entrée
├── public/                 # Assets statiques
├── index.html             # Template HTML
├── vite.config.js         # Configuration Vite
├── tailwind.config.js     # Configuration Tailwind
└── postcss.config.js      # Configuration PostCSS
```
