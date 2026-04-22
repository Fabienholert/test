const { PDFParse } = require('pdf-parse');

async function extractDataFromPDF(buffer) {
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();
  const text = data.text;
  console.log('--- TEXTE EXTRAIT DU PDF (longueur:', text.length, ') ---');
  console.log(text.substring(0, 500) + '...'); 
  
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

    // 1. OR N° (Commence par 14)
    const orMatch = noSpaceText.match(/14[0-9]{4,10}/);
    if (orMatch) result.numero = orMatch[0];

    // 2. Châssis (VIN - 17 caractères, commence par VSS, TMB ou WVW)
    const vinMatch = noSpaceText.match(/(VSS|TMB|WVW)[A-Z0-9]{14}/i);
    if (vinMatch) result.vin = vinMatch[0].toUpperCase();

    // 3. Immatriculation
    const immatMatch = cleanText.match(/[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}/i) || 
                       cleanText.match(/\d{3}\s[A-Z]{2,3}\s\d{2}/i);
    if (immatMatch) result.immatriculation = immatMatch[0].toUpperCase().replace(/[-\s]/g, '-');

    // 4. Kilométrage
    const kmMatch = cleanText.match(/(\d{1,7})\s*km/i) || cleanText.match(/kilométrage\s*:?\s*(\d{1,7})/i);
    if (kmMatch) result.kilometrage = parseInt(kmMatch[1]);

    // 5. Lettre Moteur (3-4 chars)
    const moteurMatch = cleanText.match(/moteur\s*[:\s]+([A-Z0-9]{3,4})/i);
    if (moteurMatch) result.lettreMoteur = moteurMatch[1].toUpperCase();

    // 6. Type (3-6 chars)
    const typeMatch = cleanText.match(/type\s*[:\s]+([A-Z0-9]{3,6})/i);
    if (typeMatch) result.typeVehicule = typeMatch[1].toUpperCase();

  console.log('--- RESULTAT ANALYSE ---', result);
  return result;
}

module.exports = { extractDataFromPDF };
