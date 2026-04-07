# ⚠️ Limitations & Restrictions Actuelles

Documentation des limitations de la version 0.1.0 et des améliorations prévues.

---

## 🔴 Limitations Critiques (v0.1.0)

### 1. Pas de Persistance des Données

**Problème :**

- Les données ne sont stockées qu'en **mémoire RAM**
- Toutes les données sont **perdues** après :
  - Fermeture du navigateur
  - Rechargement de la page (F5)
  - Extinction du PC
  - Redémarrage du serveur npm

**Impact :**

- ❌ Ne peut pas sauvegarder les dossiers à long terme
- ❌ Pas de récupération après crash
- ❌ Chaque session = données perdues

**Solution Prévue (v0.2.0) :**

```javascript
// LocalStorage pour session courante
localStorage.setItem("records", JSON.stringify(records));

// API backend pour persistance BD
POST / api / dossiers;
```

**Workaround Actuel :**

- Exporter les données manuellement (copier-coller du tableau)
- Ténir un registre externe
- Screenshot du tableau avant fermeture

---

### 2. Pas d'Authentification

**Problème :**

- N'importe qui peut accéder à l'app
- Pas de contrôle d'accès par utilisateur
- Pas de traçabilité qui a saisi quoi

**Impact :**

- ⚠️ Sécurité : Aucun contrôle d'accès
- ⚠️ Audit : Impossible de tracer les modifications
- ⚠️ Multi-utilisateurs : Pas de séparation des données

**Solution Prévue (v0.3.0) :**

- Système de login
- Firebase Auth ou JWT
- Rôles : Admin, Superviseur, Technicien

---

### 3. Pas d'Export de Données

**Problème :**

- Impossible d'exporter le tableau
- Format CSVOù PDF non disponible
- Pas d'impression

**Impact :**

- ❌ Pas de rapport
- ❌ Pas de sauvegarde bureautique
- ❌ Partage difficile

**Solution Prévue (v0.2.0) :**

```javascript
// Export CSV
exportToCSV(records);

// Export PDF
exportToPDF(records);
```

---

### 4. Pas de Notifications

**Problème :**

- Utilisation d'alerts() simples JavaScript
- Pas de notifications toast
- Pas de notifications de fond

**Impact :**

- ⚠️ UX basique
- ⚠️ Notifications intrusive (bloquent l'app)
- ⚠️ Pas de notifications de système

**Solution Prévue (v0.2.0) :**

```bash
npm install react-toastify
```

---

## 🟡 Limitation Moyennes (v0.1.0)

### 5. Pas de Modification des Dossiers

**Problème :**

- Impossible d'éditer un dossier après validation
- Impossible de supprimer une entrée
- Impossible de dupliquer un dossier

**Impact :**

- ⚠️ Erreur de saisie = refaire tout
- ⚠️ Pas de correction possible
- ⚠️ Aucune flexibilité

**Solution Prévue (v0.2.0) :**

```javascript
// Actions sur chaque ligne
[Éditer][Dupliquer][Supprimer];
```

---

### 6. Pas de Filtrage/Tri du Tableau

**Problème :**

- Tableau affiche TOUS les dossiers
- Impossible de trier par colonne
- Impossible de filtrer par statut

**Impact :**

- ⚠️ Avec 100+ dossiers, tableau très long
- ⚠️ Pas d'analyse rapide
- ⚠️ Recherche manuelle difficile

**Solution Prévue (v0.2.0) :**

- Click sur headers pour trier
- Filtres par Docs OK / KO
- Recherche par OR # ou DISS

---

### 7. Pas de Pagination

**Problème :**

- Si 1000 dossiers validés, page très lourde
- Tous les dossiers chargés en même temps
- Performance dégradée

**Impact :**

- ⚠️ Ralentissement avec beaucoup de données
- ⚠️ Mauvaise expérience utilisateur
- ⚠️ Impossibilité de gérer gros volumes

**Solution Prévue (v0.3.0) :**

```javascript
// Pagination
<Pagination page={1} pageSize={50} />

// Ou virtualization
<FixedSizeList />
```

---

### 8. Tous les Textes en Français

**Problème :**

- Interface uniquement en français
- Pas de support multilingue
- Pas de français/anglais/allemand

**Impact :**

- ⚠️ Peut ne pas convenir à tous les utilisateurs
- ⚠️ Nécessité de traduction future

**Solution Prévue (v0.3.0) :**

```javascript
import i18n from "i18next";
// Support FR / EN / DE
```

---

## 🟢 Limitations Mineures (v0.1.0)

### 9. Pas de Historique

**Problème :**

- Impossible de voir ce qui a changé
- Pas d'undo/redo
- Pas de journal des modifications

**Impact :**

- ℹ️ Audit incomplet
- ℹ️ Correction d'erreur difficile

**Solution Prévue (v0.4.0) :**

```javascript
// Historique complet avec timestamps
[Voir Historique]
```

---

### 10. Pas de Validation en Temps Réel

**Problème :**

- Section B ne valide que à la soumission
- Pas d'indicateur visuel des champs manquants
- Pas de mise à jour dynamique

**Impact :**

- ℹ️ Découverte des erreurs tardive
- ℹ️ UX moins fluide

**Solution Prévue (v0.2.0) :**

```javascript
// Validation immédiate
onChange={(e) => {
  validateField(e.target.name, e.target.value)
}}
```

---

### 11. Pas de Mode Hors Ligne

**Problème :**

- Dépend du serveur npm
- Pas de fonctionnement offline
- Perte de connexion = perte d'accès

**Impact :**

- ℹ️ Besoin de connexion permanente
- ℹ️ Pas de PWA

**Solution Prévue (v1.0.0) :**

```javascript
// Service Worker
registerServiceWorker();

// Sync offline
enableOfflineSync();
```

---

### 12. Pas de Multi-Onglets

**Problème :**

- Si 2 onglets ouverts
- Les changements ne se synchronisent pas
- Confused state possibles

**Impact :**

- ℹ️ Résultats imprévisibles
- ℹ️ Perte de données possible

**Solution Prévue (v1.0.0) :**

```javascript
// Broadcast Channel API
const channel = new BroadcastChannel("audit-app");
```

---

## 📋 Matrice des Limitations

| Limitation                | Impact              | Sévérité    | Quand Corrigé |
| ------------------------- | ------------------- | ----------- | ------------- |
| Pas de persistance        | Données perdues     | 🔴 CRITIQUE | v0.2.0        |
| Pas d'authentification    | Sécurité            | 🔴 CRITIQUE | v0.3.0        |
| Pas d'export              | Rapports impossible | 🟡 MAJEUR   | v0.2.0        |
| Pas de notifications      | UX basique          | 🟡 MAJEUR   | v0.2.0        |
| Pas de modification       | Inflexible          | 🟡 MAJEUR   | v0.2.0        |
| Pas de filtrage           | Gestion difficile   | 🟡 MAJEUR   | v0.2.0        |
| Pas de pagination         | Perf dégradée       | 🟡 MAJEUR   | v0.3.0        |
| Textes francais           | Limité              | 🟢 MINEUR   | v0.3.0        |
| Pas d'historique          | Audit incomplet     | 🟢 MINEUR   | v0.4.0        |
| Pas validation temps réel | UX moins fluide     | 🟢 MINEUR   | v0.2.0        |
| Pas offline               | Dépendance          | 🟢 MINEUR   | v1.0.0        |
| Pas multi-onglets         | Edge case           | 🟢 MINEUR   | v1.0.0        |

---

## 🚀 Roadmap de Résolution

### Phase v0.1.0 (Actuelle)

```
✓ Validation de conformité
✓ Formulaire de saisie
✓ Tableau de suivi
```

### Phase v0.2.0 (Semaines 1-2)

```
□ LocalStorage persistence
□ Export CSV/PDF
□ Notifications toast
□ Édition des dossiers
□ Suppression des dossiers
□ Tri et filtrage basique
□ Validation temps réel
```

### Phase v0.3.0 (Semaines 3-6)

```
□ Authentification simple
□ Multi-utilisateurs
□ Pagination
□ Multilingue (FR/EN/DE)
□ Dashboard manager
□ Historique des modifications
```

### Phase v1.0.0 (Months 2-3)

```
□ Backend API complète
□ Base de données MongoDB
□ Authentification OAuth
□ Intégration VW
□ Mode offline + PWA
□ Sync multi-onglets
□ Mobile app
□ Rapports avancés
```

---

## ⚡ Workarounds Actuels

### Pour la Persistance

```
Option 1 : Copy-paste manuel
- Sélectionner tableau
- Ctrl+C pour copier
- Coller dans Excel

Option 2 : Screenshot
- Prendre screenshot du tableau
- Sauver en image

Option 3 : Notes
- Remplir un document externe
- Synchroniser manuellement les données
```

### Pour l'Export

```
Option 1 : Copy-paste au tableau
- Copier les données du tableau
- Coller dans Excel / Google Sheets

Option 2 : Redirection API
- Implémenter export JSON
- Parser avec Python ou Node
```

### Pour la Sauvegarde

```
Option 1 : WebStorage (Limite 5-10MB)
- Ne stocke que pour ce navigateur
- Réinitialiser = perte

Option 2 : Cloud (Google Drive, Dropbox)
- Export manuel régulier
- Synchro manuelle
```

---

## ✅ Ce Qui Fonctionne Bien (v0.1.0)

- ✓ Validation de conformité exacte
- ✓ Formulaire complet et ergonomique
- ✓ Calcul automatique "Docs OK"
- ✓ Design responsive et professionnel
- ✓ Messages d'erreur clairs
- ✓ Code architecturé et maintenable
- ✓ Documentation exhaustive

---

## 📞 Questions Fréquentes

**Q : Mes données vont-elles être sauvegardées ?**
R : Non, actuellement. Elles seront perdues après rechargement. Exportez-les manuellement.

**Q : Puis-je utiliser cette app en production ?**
R : Oui, pour testing/POC. Non pour production sans persistance. Attendre v0.2.0+.

**Q : Quand aurons-nous la persistance ?**
R : Prévue pour v0.2.0 (2-4 semaines).

**Q : Le tableau peut-il contenir 1000+ dossiers ?**
R : Oui, mais la page sera lente. Pagination prévue en v0.3.0.

**Q : Puis-je modifier une saisie après validation ?**
R : Non, actuellement. Supprimez et ressaisissez. Édition prévue en v0.2.0.

**Q : Comment exporter en Excel ?**
R : Copy-paste du tableau dans Excel. Export XML prévue en v0.2.0.

---

## 🎯 Conclusion

**L'app fonctionne PARFAITEMENT pour :**

- ✓ Développement et testing
- ✓ Proof of concept
- ✓ Validation de concept

**L'app a BESOIN de :**

- ⚠️ Persistance avant production
- ⚠️ Authentification avant déploiement multi-user
- ⚠️ Export avant utilisation bureau

**Prochaines versions résoudront :**

- v0.2.0 : Persistance + Export
- v0.3.0 : Auth+ Analytics
- v1.0.0 : Production-ready

---

**Version : 0.1.0**
**Date : 7 avril 2024**

Pour les améliorations détaillées, voir [CHANGELOG.md](CHANGELOG.md).
