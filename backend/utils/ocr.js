const pdf = require('pdf-parse');

async function extractDataFromPDF(buffer) {
  const data = await pdf(buffer);
  const text = data.text;
  
  const result = {};
  
  // Regex pour le VIN (17 caractères alphanumériques, excluant I, O, Q)
  const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/i);
  if (vinMatch) result.vin = vinMatch[0].toUpperCase();
  
  // Regex pour l'immatriculation (format français AA-123-AA)
  const immatchMatch = text.match(/[A-Z]{2}-\d{3}-[A-Z]{2}/i);
  if (immatchMatch) result.immatriculation = immatchMatch[0].toUpperCase();
  
  // Regex pour le kilométrage
  const kmMatch = text.match(/(\d{1,6})\s*km/i);
  if (kmMatch) result.kilometrage = parseInt(kmMatch[1]);
  
  // Tentative d'extraction de la marque/modèle (très basique)
  const marques = ['Volkswagen', 'SEAT', 'CUPRA', 'Skoda'];
  for (const marque of marques) {
    if (text.toLowerCase().includes(marque.toLowerCase())) {
      result.marque = marque;
      break;
    }
  }

  // Extraction d'une date (format DD/MM/YYYY)
  const dateMatch = text.match(/\d{2}\/\d{2}\/\d{4}/);
  if (dateMatch) result.dateEntree = dateMatch[0];

  return result;
}

module.exports = { extractDataFromPDF };
