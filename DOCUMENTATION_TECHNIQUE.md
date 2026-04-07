# 🔧 Documentation Technique - Interfaces et Types

## 📐 Structures de Données

### ConformanceData (Section A)

```javascript
interface ConformanceData {
  reclamation: 'Oui' | 'Non' | '';
  signature: 'Oui' | 'Non' | '';
  dateEntree: string;        // Format: YYYY-MM-DD
  dateImpression: string;    // Format: YYYY-MM-DD
}

// Initialisation par défaut
const defaultConformanceData = {
  reclamation: '',
  signature: '',
  dateEntree: '',
  dateImpression: ''
}
```

### CaptureData (Section B)

```javascript
interface CaptureData {
  // Champs obligatoires de saisie libre
  orNumber: string;
  dissNumber: string;
  vin: string;
  model: string;
  km: string;
  technicien: string;
  pointageAtelier: string;
  codeDommage: string;
  codeAvarie: string;

  // Questions Oui/Non
  dissOpen: 'Oui' | 'Non' | '';
  protocole: 'Oui' | 'Non' | '';
  ppso: 'Oui' | 'Non' | '';

  // Identifiants optionnels (N° ou "Non")
  fichePedagogique: string;  // Peut être un N°, "Non", ou vide
  tpi: string;               // Peut être un N°, "Non", ou vide

  // Dates
  dateDiag: string;          // Format: YYYY-MM-DD
  sortiepromise: string;     // Format: YYYY-MM-DD
}

// Initialisation par défaut
const defaultCaptureData = {
  orNumber: '', dissNumber: '', vin: '', model: '', km: '',
  technicien: '', pointageAtelier: '', codeDommage: '', codeAvarie: '',
  dissOpen: '', protocole: '', ppso: '', fichePedagogique: '', tpi: '',
  dateDiag: '', sortiepromise: ''
}
```

### Record (Dossier stocké)

```javascript
interface Record extends ConformanceData, CaptureData {
  // Combine les deux structures pour représenter un dossier complet
}

// Un record = conformanceData + captureData fusionnés
const newRecord = {
  ...conformanceData,
  ...captureData
}
```

### ValidationMessage

```javascript
interface ValidationMessage {
  type: 'error' | 'success';
  text: string;
}

// Exemple - Erreur
const errorMessage = {
  type: 'error',
  text: 'Erreur:\n- Champ A\n- Champ B\n- Champ C'
}

// Exemple - Succès
const successMessage = {
  type: 'success',
  text: 'Dossier validé et ajouté au tableau de suivi ✓'
}
```

## 🔌 Props Interfaces

### InputField

```javascript
interface InputFieldProps {
  label: string;                    // Étiquette du champ
  name: string;                     // Attribut name du formulaire
  value: string;                    // Valeur actuelle
  onChange: (e: ChangeEvent) => void; // Handler onChange
  required?: boolean;               // Marque obligatoire (défaut: false)
  placeholder?: string;             // Texte d'aide (défaut: "")
  error?: string | null;            // Message d'erreur (défaut: null)
}
```

### SelectField

```javascript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent) => void;
  options: SelectOption[];
  required?: boolean;               // Défaut: false
  error?: string | null;            // Défaut: null
}
```

### DateField

```javascript
interface DateFieldProps {
  label: string;
  name: string;
  value: string;                    // Format: YYYY-MM-DD
  onChange: (e: ChangeEvent) => void;
  required?: boolean;               // Défaut: false
  error?: string | null;            // Défaut: null
}
```

### SectionConformance

```javascript
interface SectionConformanceProps {
  data: ConformanceData;
  onChange: (e: ChangeEvent) => void;  // Handler pour tous les champs
  validationErrors: {
    reclamation?: string;
    signature?: string;
    dateEntree?: string;
    dateImpression?: string;
  };
}
```

### SectionCapture

```javascript
interface SectionCaptureProps {
  data: CaptureData;
  onChange: (e: ChangeEvent) => void;
  validationErrors: {
    orNumber?: string;
    dissNumber?: string;
    vin?: string;
    // ... tous les 17 champs possibles
  };
}
```

### SectionTracking

```javascript
interface SectionTrackingProps {
  records: Record[];  // Tableau de dossiers validés
}
```

## ✅ Fonction de Validation

### validateAllData()

```javascript
function validateAllData(): ValidationErrors {
  const errors = {};
  const today = startOfDay(new Date());

  // Section A - Conformité

  // 1. Réclamation
  if (!conformanceData.reclamation) {
    errors.conformanceReclamation = 'Réclamation client requise'
  } else if (conformanceData.reclamation === 'Non') {
    errors.conformanceReclamation = 'BLOCAGE: Réclamation doit être "Oui"'
  }

  // 2. Signature
  if (!conformanceData.signature) {
    errors.conformanceSignature = 'Signature dossier requise'
  } else if (conformanceData.signature === 'Non') {
    errors.conformanceSignature = 'BLOCAGE: Signature dossier doit être "Oui"'
  }

  // 3. Date Entrée
  if (!conformanceData.dateEntree) {
    errors.conformanceDateEntree = 'Date d\'entrée requise'
  } else {
    const entryDate = parseISO(conformanceData.dateEntree)
    const daysDiff = differenceInDays(today, entryDate)
    if (daysDiff > 30) {
      errors.conformanceDateEntree =
        `BLOCAGE: Date d'entrée a ${daysDiff} jours (max 30)`
    }
  }

  // 4. Date Impression
  if (!conformanceData.dateImpression) {
    errors.conformanceDateImpression = 'Date d\'impression requise'
  } else {
    if (conformanceData.dateEntree &&
        isAfter(
          parseISO(conformanceData.dateImpression),
          parseISO(conformanceData.dateEntree)
        )) {
      errors.conformanceDateImpression =
        'BLOCAGE: Date d\'impression ne peut pas être après la date d\'entrée'
    }
  }

  // Section B - Saisie (9 champs texte)
  const requiredFields = [
    'orNumber', 'dissNumber', 'vin', 'model', 'km',
    'technicien', 'pointageAtelier', 'codeDommage', 'codeAvarie'
  ];

  requiredFields.forEach(field => {
    if (!captureData[field]) {
      errors[field] = 'Champ requis'
    }
  });

  // Section B - Questions Oui/Non (5 champs)
  const booleanFields = ['dissOpen', 'protocole', 'ppso'];
  booleanFields.forEach(field => {
    if (!captureData[field]) {
      errors[field] = 'Champ requis'
    }
  });

  // Section B - Identifiants optionnels
  if (!captureData.fichePedagogique) {
    errors.fichePedagogique = 'Champ requis'
  }
  if (!captureData.tpi) {
    errors.tpi = 'Champ requis'
  }

  // Section B - Dates
  if (!captureData.dateDiag) {
    errors.dateDiag = 'Champ requis'
  }
  if (!captureData.sortiepromise) {
    errors.sortiepromise = 'Champ requis'
  }

  return errors;
}
```

### calculateDocsOK(record)

```javascript
function calculateDocsOK(record: Record): boolean {
  const protocoleOK = record.protocole === 'Oui'
  const ppsoOK = record.ppso === 'Oui'
  const ficheOK = record.fichePedagogique !== 'Non' &&
                  record.fichePedagogique !== ''
  const tpiOK = record.tpi !== 'Non' &&
                record.tpi !== ''

  return protocoleOK && ppsoOK && ficheOK && tpiOK
}
```

## 🔄 État Global (App.jsx)

```javascript
// Section A
const [conformanceData, setConformanceData] = useState<ConformanceData>(
  defaultConformanceData
)

// Section B
const [captureData, setCaptureData] = useState<CaptureData>(
  defaultCaptureData
)

// Section C
const [records, setRecords] = useState<Record[]>([])

// Messages de validation
const [validationMessage, setValidationMessage] =
  useState<ValidationMessage | null>(null)
```

## 📋 Formatage des Données

### Formatage des Dates pour Affichage

```javascript
function formatDate(dateString: string): string {
  if (!dateString) return '-'
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('fr-FR')
  // Exemple: '07/04/2024'
}
```

### Calcul des Jours Écoulés

```javascript
import { differenceInDays, parseISO, startOfDay } from 'date-fns'

function getDaysDiff(dateString: string): number {
  const today = startOfDay(new Date())
  const targetDate = parseISO(dateString)
  return differenceInDays(today, targetDate)
}

// Exemple:
// Aujourd'hui: 07/04/2024
// Date saisie: 01/04/2024
// Résultat: 6 jours
```

## 📊 Agrégations du Tableau

```javascript
// Total de dossiers
const totalRecords = records.length;

// Dossiers avec Docs OK
const docsOkCount = records.filter((r) => calculateDocsOK(r)).length;

// Dossiers à revoir
const docsMissingCount = records.length - docsOkCount;

// Taux de conformité
const complianceRate =
  records.length > 0 ? Math.round((docsOkCount / records.length) * 100) : 0;
```

## 🎯 Flux d'Actions

### handleConformanceChange(event)

```javascript
const { name, value } = event.target;
setConformanceData((prev) => ({
  ...prev,
  [name]: value,
}));
// Met à jour un seul champ de Section A
```

### handleCaptureChange(event)

```javascript
const { name, value } = event.target;
setCaptureData((prev) => ({
  ...prev,
  [name]: value,
}));
// Met à jour un seul champ de Section B
```

### handleValidation()

```javascript
const errors = validateAllData();

if (Object.keys(errors).length > 0) {
  // Erreurs trouvées
  setValidationMessage({
    type: "error",
    text: `Erreurs détectées:\n${Object.values(errors).join("\n")}`,
  });
} else {
  // Succès - Ajouter au tableau
  const newRecord = { ...conformanceData, ...captureData };
  setRecords((prev) => [...prev, newRecord]);

  // Réinitialiser les formulaires
  setConformanceData(defaultConformanceData);
  setCaptureData(defaultCaptureData);

  // Message de succès
  setValidationMessage({
    type: "success",
    text: "Dossier validé et ajouté au tableau de suivi ✓",
  });

  // Effacer le message après 3 secondes
  setTimeout(() => setValidationMessage(null), 3000);
}
```

### handleReset()

```javascript
setConformanceData(defaultConformanceData);
setCaptureData(defaultCaptureData);
setValidationMessage(null);
// Réinitialise tout sauf les records du tableau
```

## 🔐 Règles de Blocage Détaillées

### Blocage 1: Réclamation = Non

```javascript
if (conformanceData.reclamation === "Non") {
  // ❌ BLOCAGE
  // Validation impossible
}
```

### Blocage 2: Signature = Non

```javascript
if (conformanceData.signature === "Non") {
  // ❌ BLOCAGE
  // Validation impossible
}
```

### Blocage 3: Date Entrée > 30 jours

```javascript
const entryDate = parseISO(conformanceData.dateEntree);
const today = startOfDay(new Date());
const daysDiff = differenceInDays(today, entryDate);

if (daysDiff > 30) {
  // ❌ BLOCAGE
  // Remarque: daysDiff = nombre de jours AVANT aujourd'hui
  // daysDiff <= 0 = date future ou aujourd'hui
}
```

### Blocage 4: Date Impression après Date Entrée

```javascript
const printDate = parseISO(conformanceData.dateImpression);
const entryDate = parseISO(conformanceData.dateEntree);

if (isAfter(printDate, entryDate)) {
  // ❌ BLOCAGE
  // Date impression doit être AVANT ou ÉGALE à date entrée
}
```

## 📱 Tailwind Classes Personnalisées

Les classes composants sont définis dans `src/index.css` avec `@layer`:

```css
.section-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  /* + focus states */
}

/* Couleurs personnalisées */
.border-compliance {
  border-color: #ff8c00;
}
.border-capture {
  border-color: #0066cc;
}
.border-validation {
  border-color: #22c55e;
}

.bg-compliance {
  background-color: #ff8c00;
}
.bg-capture {
  background-color: #0066cc;
}
.bg-validation {
  background-color: #22c55e;
}
```

---

**Cette documentation sert de référence pour les développeurs.**
Pour les utilisateurs, consultez `GUIDE_UTILISATEUR.md`.
