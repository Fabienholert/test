const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Cache pour les données
let damagesCache = null;

router.get('/damages', (req, res) => {
  console.log('Requête reçue pour /api/references/damages');
  try {
    if (damagesCache) {
      console.log('Retour des données depuis le cache');
      return res.json(damagesCache);
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'Feuille de calcul sans titre.xlsx');
    console.log('Recherche du fichier Excel à:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('Fichier non trouvé:', filePath);
      return res.status(404).json({ message: 'Fichier de référence non trouvé' });
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // On utilise header: 1 pour avoir les lignes brutes (tableaux)
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const damages = [];
    
    data.forEach((row, index) => {
      // On commence à la ligne 10 (index 9) d'après l'analyse
      if (index < 9) return;

      // Set 1 (Colonnes A et B -> index 0 et 1)
      const label1 = row[0];
      const code1 = row[1];
      if (label1 && code1 && String(label1).length > 2 && label1 !== 'Libellé code dommage') {
        damages.push({ label: String(label1).trim(), code: String(code1).trim() });
      }

      // Set 2 (Colonnes C et D -> index 2 et 3)
      const label2 = row[2];
      const code2 = row[3];
      if (label2 && code2 && String(label2).length > 2 && String(code2).length <= 10 && label2 !== 'Renseignez le terme recherché') {
        damages.push({ label: String(label2).trim(), code: String(code2).trim() });
      }
    });

    // Déduplication
    const uniqueDamages = Array.from(new Set(damages.map(d => JSON.stringify(d))))
      .map(s => JSON.parse(s));

    // Tri alphabétique
    uniqueDamages.sort((a, b) => a.label.localeCompare(b.label));

    console.log(`Données chargées: ${uniqueDamages.length} dommages trouvés.`);
    damagesCache = uniqueDamages;
    res.json(uniqueDamages);
  } catch (err) {
    console.error('Erreur lecture Excel:', err);
    res.status(500).json({ message: 'Erreur lors de la lecture du fichier de référence' });
  }
});

module.exports = router;
