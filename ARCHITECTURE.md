# 📐 Architecture du Projet - Audit Garantie VW

## 🗂️ Structure du Dossier

```
Fabienholert/
├── src/
│   ├── components/
│   │   ├── InputField.jsx           # Composant réutilisable pour les champs texte
│   │   ├── SelectField.jsx          # Composant réutilisable pour les sélecteurs
│   │   ├── DateField.jsx            # Composant réutilisable pour les dates
│   │   ├── SectionConformance.jsx   # Section A : Validation de conformité
│   │   ├── SectionCapture.jsx       # Section B : Formulaire de saisie
│   │   └── SectionTracking.jsx      # Section C : Tableau de suivi
│   ├── App.jsx                      # Composant principal (orchestrateur)
│   ├── index.css                    # Styles Tailwind CSS
│   └── main.jsx                     # Point d'entrée React
├── public/                          # Assets statiques (images, etc.)
├── index.html                       # Template HTML principal
├── package.json                     # Dépendances et scripts
├── vite.config.js                   # Configuration du bundler Vite
├── tailwind.config.js               # Configuration du framework CSS
├── postcss.config.js                # Configuration PostCSS
├── .eslintrc.json                   # Règles de linting
├── .gitignore                       # Fichiers à ignorer par Git
├── README.md                        # Documentation principale
├── INSTALLATION.md                  # Guide d'installation
└── ARCHITECTURE.md                  # Ce fichier
```

## 🔄 Flux de Données

```
┌─────────────────────────────────────────────────────────┐
│                      App.jsx                             │
│                  (Gestion d'état)                        │
└────────┬────────────────────────────┬────────────────────┘
         │                            │
         ├─────────────────────────────┼────────────────────────┐
         │                             │                        │
         ▼                             ▼                        ▼
  conformanceData              captureData              records[]
  - reclamation          - orNumber              Liste des dossiers
  - signature            - dissNumber            validés
  - dateEntree           - vin
  - dateImpression       - model
                         - km
                         ... (15 champs)
         │                             │                        │
         ▼                             ▼                        ▼
  SectionConformance       SectionCapture          SectionTracking
  (Section A)              (Section B)              (Section C)
  - Validation stricte     - Formulaire multipart  - Tableau HTML
  - Blocages              - 17 champs requis      - Calcul Docs OK
  - Messages d'erreur     - Validation             - Statistiques
```

## 📊 États React (useState)

### Dans App.jsx :

```javascript
// Section A - Conformité
const [conformanceData, setConformanceData] = useState({
  reclamation: '',
  signature: '',
  dateEntree: '',
  dateImpression: ''
})

// Section B - Saisie
const [captureData, setCaptureData] = useState({
  orNumber: '', dissNumber: '', vin: '', model: '', km: '',
  technicien: '', pointageAtelier: '', codeDommage: '', codeAvarie: '',
  dissOpen: '', protocole: '', ppso: '', fichePedagogique: '', tpi: '',
  dateDiag: '', sortiepromise: ''
})

// Section C - Suivi
const [records, setRecords] = useState([])

// Message de validation
const [validationMessage, setValidationMessage] = useState(null)
```

## 🎯 Composants Détaillés

### 1️⃣ InputField.jsx
**Rôle :** Champ texte réutilisable
**Props :**
- `label` : Étiquette du champ
- `name` : Identifiant du formulaire
- `value` : Valeur actuelle
- `onChange` : Handler de changement
- `required` : Marque le champ obligatoire
- `placeholder` : Texte d'aide
- `error` : Message d'erreur

**Utilisé par :** SectionCapture.jsx

### 2️⃣ SelectField.jsx
**Rôle :** Sélecteur (dropdown) réutilisable
**Props :**
- `label` : Étiquette du sélecteur
- `name` : Identifiant du formulaire
- `value` : Valeur sélectionnée
- `onChange` : Handler de changement
- `options` : Tableau d'objets {value, label}
- `required` : Marque obligatoire
- `error` : Message d'erreur

**Utilisé par :** SectionConformance.jsx, SectionCapture.jsx

### 3️⃣ DateField.jsx
**Rôle :** Sélecteur de date réutilisable
**Props :**
- `label` : Étiquette du champ
- `name` : Identifiant du formulaire
- `value` : Date au format YYYY-MM-DD
- `onChange` : Handler de changement
- `required` : Marque obligatoire
- `error` : Message d'erreur

**Utilisé par :** SectionConformance.jsx, SectionCapture.jsx

### 4️⃣ SectionConformance.jsx
**Rôle :** Validation stricte des critères de conformité
**Logique :**
- Validation immédiate (sans clic)
- Affichage d'alertes en temps réel
- Calcul des jours écoulés
- Comparaison de dates

**Règles :**
```javascript
❌ BLOCAGE SI :
  - reclamation === 'Non'
  - signature === 'Non'
  - daysDiff(today, dateEntree) > 30
  - isAfter(dateImpression, dateEntree)
```

### 5️⃣ SectionCapture.jsx
**Rôle :** Formulaire de saisie complet
**Sections :**
1. Champs obligatoires (9 champs)
2. Questions Oui/Non (5 champs)
3. Dates (2 champs)

**Total :** 17 champs requis

### 6️⃣ SectionTracking.jsx
**Rôle :** Tableau de suivi et statistiques
**Colonnes :**
1. OR # - Identifiant unique
2. N°DISS - Numéro DISS
3. VIN - Numéro VIN
4. Modèle - Modèle véhicule
5. KM - Kilométrage
6. Technicien - Nom du technicien
7. Protocole - Oui/Non (badge couleur)
8. PPSO - Oui/Non (badge couleur)
9. **Docs OK** - ✓/✗ (calculé automatiquement)
10. Diag - Date formatée
11. Sortie Promise - Date formatée

**Calcul "Docs OK" :**
```javascript
Docs OK = 
  protocole === 'Oui' AND
  ppso === 'Oui' AND
  fichePedagogique !== 'Non' AND fichePedagogique !== '' AND
  tpi !== 'Non' AND tpi !== ''
```

## 🔐 Validation Complète

### Phase 1 : Validation de Conformité
```
validateConfirmance() → conformanceData
  ├─ reclamation === 'Oui' ? ✓ : ✗ BLOCAGE
  ├─ signature === 'Oui' ? ✓ : ✗ BLOCAGE
  ├─ dateEntree <= 30 jours ? ✓ : ✗ BLOCAGE
  └─ dateImpression <= dateEntree ? ✓ : ✗ BLOCAGE
```

### Phase 2 : Validation de Saisie
```
validateCapture() → captureData
  ├─ orNumber !== '' ? ✓ : ✗ ERREUR
  ├─ dissNumber !== '' ? ✓ : ✗ ERREUR
  ├─ vin !== '' ? ✓ : ✗ ERREUR
  └─ ... (14 autres champs)
```

### Phase 3 : Validation Globale
```
validateAllData() = validateConfirmance() + validateCapture()
  ├─ Si erreurs → Afficher alerte détaillée → ARRÊT
  └─ Si 100% OK → Créer enregistrement → Ajouter à tableau
```

## 🎨 Styles Tailwind CSS

### Couches Personnalisées (@layer components)

```css
.section-card { /* Cartes principales */ }
.section-title { /* Titres de section */ }
.form-group { /* Groupes de champs */ }
.form-label { /* Étiquettes */ }
.form-input { /* Champs texte */ }
.form-select { /* Sélecteurs */ }
.btn { /* Boutons */ }
.btn-primary { /* Bouton vert "Valider" */ }
.btn-secondary { /* Bouton gris "Réinitialiser" */ }
.alert-error { /* Alerte rouge */ }
.alert-warning { /* Alerte jaune */ }
.alert-success { /* Alerte verte */ }
```

### Couleurs Personnalisées

```javascript
extend: {
  colors: {
    compliance: '#FF8C00',   // 🟠 Orange
    capture: '#0066CC',     // 🔵 Bleu
    validation: '#22C55E',  // 🟢 Vert
  }
}
```

## 🔄 Flux de Validation Complet

```
┌─────────────────────────────────────────────────────────────┐
│ Utilisateur remplit formulaires Section A et Section B       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ Clic sur "Valider la Réception"                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ validateAllData() exécutée                                   │
│ - Vérifie tous les champs                                    │
│ - Accumule toutes les erreurs                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
         ERREURS         SANS ERREURS
          TROUVÉES          ✓
            │                 │
            ▼                 ▼
    Afficher alerte    ✓ Créer record
    détaillée (avec    ✓ Ajouter à records[]
    tous les champs    ✓ Réinitialiser forms
    en erreur)         ✓ Afficher succès
                       ✓ Masquer msg après 3s
```

## 📱 Responsive Design

Application entièrement responsive utilisant la grille Tailwind :
- **Mobile :** 1 colonne
- **Tablet (md):** 2 colonnes
- **Desktop (lg):** 3 colonnes (Capture) / 2 colonnes (Conformance)

## 🚀 Performance

- **Vite :** Build ultra-rapide et HMR instantanu
- **Tailwind CSS :** CSS purgé (seulement les styles utilisés)
- **date-fns :** Libraire légère pour les dates (~3KB gzippées)
- **React 18 :** Concurrent features pour meilleure réactivité

## 🔌 Intégrations Possibles

Le projet est conçu pour pouvoir facilement intégrer :
- **API Backend :** Sauvegarder les données en BD
- **LocalStorage :** Persistance en mémoire locale
- **Export CSV/PDF :** Exporter le tableau de suivi
- **Authentication :** Système de connexion utilisateur
- **Notifications :** Alertes toast remplaçant les alerts()
- **Dark Mode :** Support du mode sombre avec Tailwind
