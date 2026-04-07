const XLSX = require("xlsx");
const path = require("path");

let damagesData = [];

// Charger les données du fichier Excel au démarrage
const loadDamagesData = () => {
  try {
    const filePath = path.join(__dirname, "../models/nouveau.xlsx");
    const workbook = XLSX.readFile(filePath);
    // Lire la feuille "Liste des dommages"
    const sheetName = "Liste des dommages";
    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(`Feuille "${sheetName}" pas trouvée`);
    }
    const worksheet = workbook.Sheets[sheetName];
    // Lire en format tableau (header: 1) et ignorer les 2 premières lignes
    const allData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const rows = allData.slice(2); // Ignorer les 2 premières lignes

    // La ligne 3 (index 2) contient les en-têtes réels
    const headers = rows[0];
    const dataRows = rows.slice(1);

    // Parser les données
    damagesData = dataRows
      .map((row) => ({
        libelle: row[0] ? String(row[0]).trim() : "",
        code: row[1] ? String(row[1]).trim() : "",
      }))
      .filter(
        (item) => item.code && item.libelle && item.code !== "code Dommage",
      );

    console.log(
      `✅ ${damagesData.length} dommages chargés depuis le fichier Excel`,
    );
    return true;
  } catch (error) {
    console.error(
      "❌ Erreur lors du chargement du fichier Excel:",
      error.message,
    );
    return false;
  }
};

// Chercher un dommage par libellé
const searchByLabel = (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }

  const term = searchTerm.toLowerCase();
  return damagesData
    .filter((item) => item.libelle.toLowerCase().includes(term))
    .slice(0, 10); // Retourner max 10 résultats
};

// Chercher un code exact
const getCodeByLabel = (label) => {
  if (!label) return null;

  const found = damagesData.find(
    (item) => item.libelle.toLowerCase() === label.toLowerCase(),
  );

  return found ? found.code : null;
};

// Retourner tous les dommages
const getAllDamages = () => {
  return damagesData;
};

module.exports = {
  loadDamagesData,
  searchByLabel,
  getCodeByLabel,
  getAllDamages,
};
