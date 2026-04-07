# 📖 Guide Utilisateur - Audit Garantie VW

## 🎯 Objectif de l'Application

Cette application permet aux réceptionnaires automobiles de :

1. ✓ Vérifier la conformité OR des dossiers de garantie
2. ✓ Saisir l'intégralité des données techniques du véhicule
3. ✓ Suivre la conformité des dossiers dans un tableau centralisé
4. ✓ Analyser les statistiques de conformité

## 🚀 Démarrage Rapide

### Pour la première fois

1. Ouvrez le dossier `/Users/fabienholert/Desktop/developpemen t/Fabienholert` dans VS Code
2. Ouvrez un terminal : Ctrl+` (ou Terminal → New Terminal)
3. Lancez : `npm install && npm run dev`
4. L'app s'ouvrira automatiquement sur http://localhost:5173

### Pour les fois suivantes

```bash
npm run dev
```

## 📋 Comment Utiliser l'Application

### Section A : Conformité OR (Blocage)

⚠️ **IMPORTANTE** : Cette section gère les critères de blocage obligatoires

#### Champs à remplir :

1. **Réclamation client**
   - Options : **Oui** ou **Non**
   - ❌ BLOCAGE si **Non**
   - Signification : Le client a-t-il formulé une réclamation ?

2. **Signature dossier**
   - Options : **Oui** ou **Non**
   - ❌ BLOCAGE si **Non**
   - Signification : Le dossier est-il signé ?

3. **Date d'entrée véhicule**
   - Type : Date picker
   - ❌ BLOCAGE si plus de 30 jours d'écart avec aujourd'hui
   - Exemple : Aujourd'hui 7 avril → Maximum 8 mars

4. **Date d'impression OR**
   - Type : Date picker
   - ❌ BLOCAGE si postérieure à la date d'entrée
   - Règle : Date d'impression ≤ Date d'entrée

#### Comment lire le Status :

```
✓ Conformité Validée (vert)
  → Vous pouvez remplir la Section B

✗ NON CONFORME (rouge avec détails)
  → Vous DEVEZ corriger avant de valider
  → Lire les messages d'erreur détaillés
```

### Section B : Fiche de Saisie Réception

📝 **Tous les champs sont obligatoires**

#### Champs de Saisie Libre (9 champs)

| Champ            | Exemple           | Note                  |
| ---------------- | ----------------- | --------------------- |
| OR #             | OR-2024-001       | Identifiant unique OR |
| N°DISS           | DISS-1234         | Numéro dossier DISS   |
| VIN              | WVWZZZ3CZ9E123456 | 17 caractères         |
| Modèle           | Golf 8 TSI        | Modèle du véhicule    |
| KM               | 45000             | Kilométrage actuel    |
| Technicien       | Jean Dupont       | Nom du technicien     |
| Pointage Atelier | AT-001            | Code atelier          |
| Code Dommage     | DMG-001           | Code sinistre         |
| Code Avarie      | AVR-001           | Code défaut           |

#### Questions Oui/Non (5 champs)

| Champ              | Options   | Signification                       |
| ------------------ | --------- | ----------------------------------- |
| DISS ouvert        | Oui / Non | Le dossier DISS est-il ouvert ?     |
| Protocole en ligne | Oui / Non | Protocole d'accès en ligne activé ? |
| PPSO               | Oui / Non | Procédure post-SAV OK ?             |

#### Identifiants Optionnels (2 champs)

| Champ             | Format      | Notes                                |
| ----------------- | ----------- | ------------------------------------ |
| Fiche pédagogique | N° ou "Non" | Saisissez le numéro ou écrivez "Non" |
| TPI               | N° ou "Non" | Formation TPI ou "Non"               |

#### Dates (2 champs)

| Champ          | Type        | Exemple    |
| -------------- | ----------- | ---------- |
| Date du Diag   | Date picker | 05/04/2024 |
| Sortie Promise | Date picker | 10/04/2024 |

#### 💡 Conseils de Remplissage

- Utilisez des codes à bulle ou codes à barres pour les numéros
- Chaque champ a un crochet ✓ ou une alerte ✗ en temps réel
- Tous les champs doivent être remplis (pas de champs vides)
- Les dates doivent être valides (vérifiez le calendrier)

### Section C : Tableau de Suivi

📊 **Affichage automatique après validation réussie**

#### Architecture du Tableau

Le tableau affiche tous les dossiers validés avec :

**Colonnes de Base :**

- **OR #** : Identifiant unique (trier par défaut)
- **N°DISS** : Numéro DISS
- **VIN** : Numéro de châssis
- **Modèle** : Modèle véhicule
- **KM** : Kilométrage
- **Technicien** : Nom du technicien

**Colonnes de Conformité :**

- **Protocole** : Badge ✓ (vert) ou ✗ (rouge)
- **PPSO** : Badge ✓ (vert) ou ✗ (rouge)
- **Docs OK** : Colonne principale (verte si OK, rouge sinon)

**Colonnes de Dates :**

- **Diag** : Date formatée (JJ/MM/AAAA)
- **Sortie Promise** : Date formatée (JJ/MM/AAAA)

#### 🟢 Colonne "Docs OK" (Important !)

Cette colonne calcule automatiquement si la documentation est complète :

```
Docs OK = ✓ OUI si :
  ✓ Protocole = Oui AND
  ✓ PPSO = Oui AND
  ✓ Fiche pédagogique ≠ "Non" et ≠ "" AND
  ✓ TPI ≠ "Non" et ≠ ""

Docs OK = ✗ NON si :
  ✗ N'importe quel critère ci-dessus est faux
```

#### Exemple

| Scenario          | Protocole | PPSO | Fiche  | TPI     | Docs OK |
| ----------------- | --------- | ---- | ------ | ------- | ------- |
| ✓ Tous OK         | Oui       | Oui  | FP-001 | TPI-001 | ✓ OUI   |
| ✗ Fiche manquante | Oui       | Oui  | Non    | TPI-001 | ✗ NON   |
| ✗ TPI manquant    | Oui       | Oui  | FP-001 | Non     | ✗ NON   |
| ✗ PPSO manquant   | Oui       | Non  | FP-001 | TPI-001 | ✗ NON   |

### Statistiques en Direct

En bas de la page :

```
┌──────────────────┬─────────────┬──────────────┬──────────┐
│ Total Dossiers   │ Docs OK     │ Docs À Revoir│ Taux OK  │
├──────────────────┼─────────────┼──────────────┼──────────┤
│ 15               │ 12          │ 3            │ 80%      │
└──────────────────┴─────────────┴──────────────┴──────────┘
```

## ⚠️ Fonctionnalités de Contrôle

### Bouton "Valider la Réception"

**Action :**

1. Vérifie tous les champs (Section A + B)
2. Accumule les erreurs s'il y en a
3. Affiche une alerte détaillée si erreurs
4. **OU** ajoute le dossier au tableau et réinitialise

**Cas d'Erreur - Message Exemple :**

```
❌ Erreur:
  - Réclamation client requise
  - Code Avarie manquant
  - Date Diag manquante
```

**Cas de Succès - Message :**

```
✅ Succès: Dossier validé et ajouté au tableau de suivi ✓
(Le message disparaît après 3 secondes)
```

### Bouton "Réinitialiser"

**Action :**

- Vide TOUS les formulaires des Sections A et B
- Efface tous les messages d'erreur
- Garders les données du tableau (non supprimées)

**Cas d'Usage :**

- Commencer un nouveau dossier
- Corriger une erreur d'entrée en masse
- Recommencer une saisie

## 🔍 Scénarios d'Utilisation

### Scénario 1 : Dossier 100% Conforme

```
1. Remplir Section A
   ✓ Réclamation = Oui
   ✓ Signature = Oui
   ✓ Date entrée = 01/04/2024 (< 30j)
   ✓ Date impression = 02/04/2024

2. Remplir Section B (tous les 17 champs)

3. Cliquer "Valider"
   ✅ "Dossier validé et ajouté au tableau"

4. Consulter Section C
   → Votre dossier apparaît dans le tableau
   → Colonne Docs OK = ✓ OUI (si Protocole=Oui + PPSO=Oui + Fiche/TPI != Non)
```

### Scénario 2 : Réclamation Client = Non (BLOCAGE)

```
1. Remplir Section A
   ✓ Réclamation = Non ← ❌ BLOCAGE

2. Section A affiche :
   Alert ROUGE : "BLOCAGE: Réclamation doit être 'Oui'"

3. Corriger : Changer Réclamation à "Oui"
   → Le status passe à "✓ CONFORME"

4. Continuer avec Section B...
```

### Scénario 3 : Date d'Entrée Trop Ancienne (BLOCAGE)

```
Aujourd'hui : 07/04/2024

1. Remplir Section A
   Date entrée = 01/03/2024 ← 37 jours !

2. Section A affiche :
   Alert ROUGE : "BLOCAGE: Date d'entrée a 37 jours (max 30)"

3. Corriger : Changer date à > 08/03/2024
   → Le status passe à "✓ CONFORME"
```

### Scénario 4 : Section B Incomplète

```
1. Sections A et B remplies sauf "Technicien" (oublié)

2. Cliquer "Valider"
   ❌ Alert ROUGE : "Erreur détectées:
       - Technicien (Saisie libre) manquant"

3. Remplir le champ manquant
   → Cliquer "Valider" à nouveau
   ✅ "Dossier validé et ajouté au tableau"
```

## 📊 Interprétation des Statistiques

### Taux OK à 100% - ✓ Excellent

Tous les dossiers ont protocole=Oui, PPSO=Oui, Fiche/TPI remplis

### Taux OK à 80% - ⚠️ À Améliorer

3 dossiers sur 15 ont des documents manquants
→ Action requise : Vérifier les dossiers en rouge

### Taux OK à 0% - ❌ Critique

Aucun dossier n'a une documentation complète
→ Action urgente : Revoir tous les dossiers

## 💾 Conservation des Données

**IMPORTANT :** Les données sont stockées **EN MÉMOIRE SEULEMENT**

```
✓ Pendant la session    → Données visibles dans le tableau
✗ Après fermeture       → Données perdues
```

**Pour conserver les données :**

Solutions à implémenter (à venir) :

- Exporter en CSV
- Sauvegarde en LocalStorage
- Connexion à une base de données

## 🆘 Assistance et Dépannage

### L'application ne démarre pas

1. Vérifiez que `npm run dev` est en cours
2. Vérifiez que http://localhost:5173 est accessible
3. Regardez les erreurs dans le terminal npm

### Un champ ne se réinitialise pas

1. Cliquez sur "Réinitialiser"
2. Si ça persiste, rafraîchissez la page (F5)

### Les dates s'affichent mal

1. Assurez-vous d'utiliser le format locale FR
2. Les dates sont formatées automatiquement en JJ/MM/AAAA

### Le tableau reste vide

1. Avez-vous cliqué sur "Valider la Réception" ?
2. Tous les champs sont-ils remplis ?
3. Regardez les messages d'erreur en rouge

## 📞 Support et Questions

En cas de problème :

1. Vérifiez ce guide utilisateur (section débutants)
2. Lisez les messages d'erreur détaillés
3. Consultez le README.md pour l'architecture
4. Vérifiez INSTALLATION.md pour les problèmes d'environnement

---

**Bienvenue dans Audit Garantie VW ! 🚗**

Pour toute question, consultez votre administrateur système.
