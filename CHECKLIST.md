# ✅ Check-list de Démarrage - Audit Garantie VW

Suivez cette check-list pour mettre en place l'application avec succès.

## 🔧 Étape 1 : Vérifier l'Environnement

### Vérifier Node.js

```bash
node --version
npm --version
```

**✓ Si vous avez v16 ou plus** → Continuer à l'étape 2
**✗ Si commande non trouvée** → Installer Node.js (voir INSTALLATION.md)

- [ ] Node.js v16+ installé
- [ ] npm v7+ installé
- [ ] Versions vérifiées en terminal

## 🚀 Étape 2 : Installation du Projet

### Naviguer dans le dossier

```bash
cd "/Users/fabienholert/Desktop/developpemen t/Fabienholert"
```

### Installer les dépendances

```bash
npm install
```

**⏳ Cela peut prendre 1-3 minutes**

- [ ] Dossier `node_modules/` créé
- [ ] Fichier `package-lock.json` généré
- [ ] Aucune erreur en rouge dans la console

## 🎯 Étape 3 : Lancer l'Application

### Démarrer le serveur de développement

```bash
npm run dev
```

**✓ Le serveur devrait afficher:**
```
  VITE v5.0.0  ready in XXX ms
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**✗ L'app ne s'ouvre pas ?**
- Ouvrez manuellement http://localhost:5173
- Vérifiez que le port 5173 est libre

- [ ] Terminal affiche "ready in XXX ms"
- [ ] URL affichée : http://localhost:5173
- [ ] Page chargée dans le navigateur
- [ ] Aucune erreur en console (F12)

## 🎨 Étape 4 : Vérifier l'Interface

### Apparence Générale

- [ ] En-tête orange avec titre "🚗 Audit Garantie VW"
- [ ] 3 sections distinctes visibles (Orange, Bleu, Vert)
- [ ] Boutons "Valider la Réception" et "Réinitialiser" présents

### Section A : Conformité OR

- [ ] Titre "Section A : Conformité OR (Blocage)" en orange
- [ ] 4 champs visibles :
  - [ ] Sélecteur "Réclamation client" (Oui/Non)
  - [ ] Sélecteur "Signature dossier" (Oui/Non)
  - [ ] Sélecteur de date "Date d'entrée véhicule"
  - [ ] Sélecteur de date "Date d'impression OR"
- [ ] Message de status en vert "✓ Conformité Validée" OU rouge "✗ NON CONFORME"

### Section B : Fiche de Saisie Réception

- [ ] Titre "Section B : Fiche de Saisie Réception" en bleu
- [ ] Sous-section "Champs Obligatoires (Saisie Libre)" avec 9 champs
- [ ] Sous-section "Questions Obligatoires" avec 5 champs
- [ ] Sous-section "Dates" avec 2 champs

### Section C : Tableau de Suivi

- [ ] Titre "Section C : Tableau de Suivi" en vert
- [ ] Message "Aucun dossier validé pour le moment" (normal au départ)

## 🧪 Étape 5 : Tester les Fonctionnalités

### Test 1 : Validation de Conformité

1. **Remplir Section A correctement :**
   - Réclamation = "Oui"
   - Signature = "Oui"
   - Date d'entrée = aujourd'hui ou récemment
   - Date d'impression = aujourd'hui ou avant l'entrée

2. **Attendre et vérifier :**
   - [ ] Message "✓ Conformité Validée" s'affiche en vert
   - [ ] Pas de messages d'erreur

### Test 2 : Blocage Réclamation

1. **Changer Réclamation à "Non"**
2. **Attendre et vérifier :**
   - [ ] Message d'erreur "BLOCAGE: Réclamation doit être 'Oui'"
   - [ ] Status passe à rouge "✗ NON CONFORME"
   - [ ] Message disparaît quand on remet "Oui"

### Test 3 : Validation Globale

1. **Remplir TOUS les champs Section A et B :**
   - Section A : Conforme ✓
   - Section B : Tous les 17 champs remplis
2. **Cliquer "Valider la Réception"**
3. **Vérifier :**
   - [ ] Message vert "✅ Succès: Dossier validé..."
   - [ ] Une ligne apparaît dans le tableau (Section C)
   - [ ] Les formulaires sont vidés
   - [ ] Message disparaît après ~3 secondes

### Test 4 : Erreur de Validation

1. **Remplir Section A correctement**
2. **Laisser au moins 1 champ vide en Section B**
3. **Cliquer "Valider la Réception"**
4. **Vérifier :**
   - [ ] Message rouge "❌ Erreur: Erreurs détectées"
   - [ ] Liste les champs manquants
   - [ ] Dossier N'est PAS ajouté au tableau

### Test 5 : Colonne "Docs OK"

1. **Valider un dossier avec :**
   - Protocole = "Oui"
   - PPSO = "Oui"
   - Fiche pédagogique = "FP-001" (N° quelconque)
   - TPI = "TPI-001" (N° quelconque)

2. **Vérifier dans le tableau :**
   - [ ] Colonne "Docs OK" affiche "✓ OUI" (vert)

3. **Valider un deuxième dossier avec :**
   - Protocole = "Oui"
   - PPSO = "Oui"
   - Fiche pédagogique = "Non"
   - TPI = "TPI-001"

4. **Vérifier :**
   - [ ] Colonne "Docs OK" affiche "✗ NON" (rouge)
   - [ ] Statistiques mettent à jour: "1/2" dossiers OK

### Test 6 : Bouton Réinitialiser

1. **Remplir les 2 sections**
2. **Cliquer "Réinitialiser"**
3. **Vérifier :**
   - [ ] Tous les champs sont vidés
   - [ ] Messages d'erreur disparaissent
   - [ ] Tableau de suivi conserve les dossiers (non supprimés)

## 🐛 Étape 6 : Dépannage

### Erreur "port 5173 déjà utilisé"
```bash
# Tuer le processus
lsof -ti:5173 | xargs kill -9

# Ou modifier le port dans vite.config.js
server: { port: 5174 }
```

### Erreurs de dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### La page ne se rafraîchit pas
```
- Vérifiez que vous êtes sur http://localhost:5173 (pas 5174, 3000, etc.)
- Videz le cache du navigateur : Ctrl+Maj+Suppr
- Rechargez la page : F5
```

### Messages d'erreur en console (F12)
- Les warnings jaunes sont normaux
- Si erreurs rouges : vérifiez les étapes 1-2

- [ ] Aucune erreur bloquante en console
- [ ] Application responsive (testez en redimensionnant)

## ✨ Étape 7 : Premiers Pas en Production

### Remplissage Réel

- [ ] Testez avec des vraies données de dossiers
- [ ] Vérifiez les dates réelles (pas plus de 30 jours)
- [ ] Ajoutez plusieurs dossiers au tableau
- [ ] Visualisez les statistiques

### Ajustements

- [ ] Couleurs correspondent aux standards VW ?
- [ ] Textes et labels appropriés ?
- [ ] Tous les champs nécessaires ?

### Sauvegarde

- [ ] Données à exporter avant fermeture (elles seront perdues)
- [ ] À implémenter : LocalStorage, CSV, API Backend

## 📊 Étape 8 : Vérification Finale

Vérifiez cette liste avant validation finale :

- [ ] ✓ App démarre sans erreur
- [ ] ✓ Toutes les sections sont visibles
- [ ] ✓ Validation fonctionne
- [ ] ✓ Tableau affiche les dossiers
- [ ] ✓ Docs OK se calcule correctement
- [ ] ✓ Messages d'erreur affichent les bonnes infos
- [ ] ✓ Responsive design fonctionne
- [ ] ✓ Aucune erreur en console

## 🎉 Installation Réussie !

Si vous avez coché ✓ tous les points ci-dessus, **la setup est complète !**

### Prochaines Étapes

Voir les fichiers de documentation :
- **Pour utiliser** : `GUIDE_UTILISATEUR.md`
- **Architecture** : `ARCHITECTURE.md`
- **Développement** : `DOCUMENTATION_TECHNIQUE.md`

### Arrêter l'Application

```bash
Ctrl+C dans le terminal
```

### Redémarrer

```bash
npm run dev
```

---

**Besoin d'aide ?**
1. Relisez INSTALLATION.md
2. Vérifiez les erreurs en console (F12)
3. Consultez GUIDE_UTILISATEUR.md pour les fonctionnalités

**Bon travail !** 🚗✨
