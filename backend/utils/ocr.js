const { PDFParse } = require('pdf-parse');

async function extractDataFromPDF(buffer) {
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();
  const text = data.text;
  console.log('--- TEXTE EXTRAIT DU PDF (longueur:', text.length, ') ---');
  console.log(text.substring(0, 500) + '...'); 
  
  const result = {};
  
  const cleanText = text.replace(/[^A-Z0-9\s-]/gi, '');
  const noSpaceText = text.replace(/\s/g, '');

  // 1. OR N° (6 chiffres, généralement commence par 14)
  const orMatch = cleanText.match(/\b(14\d{4})\b/) || cleanText.match(/\b(\d{6})\b/);
  if (orMatch) result.numero = orMatch[1];

  // 2. Châssis (VIN - 17 caractères, commence par VSS, TMB ou WVW)
  const vinMatch = noSpaceText.match(/(VSS|TMB|WVW)[A-Z0-9]{14}/i);
  if (vinMatch) result.vin = vinMatch[0].toUpperCase();

  // 3. Immatriculation
  const immatMatch = cleanText.match(/[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}/i) || 
                     cleanText.match(/\d{3}\s[A-Z]{2,3}\s\d{2}/i);
  if (immatMatch) result.immatriculation = immatMatch[0].toUpperCase().replace(/[-\s]/g, '-');

  // 4. Kilométrage (juste en dessous de KM, souvent manuscrit)
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    // On cherche le mot isolé "km" ou "kilom"
    if (lineLower.match(/\bkm\b/) || lineLower.includes('kilom')) {
      // On regarde la ligne suivante (ou la 2e si ligne vide)
      for (let j = 1; j <= 2; j++) {
        if (lines[i + j]) {
          // Retire tous les espaces (ex: "12 000" -> "12000") et corrige les 'o' manuscrits lus au lieu de zéros
          let lineBelowStripped = lines[i + j].replace(/\s+/g, '').replace(/[Oo]/g, '0');
          // Le nombre doit être seul sur la ligne (ou suivi éventuellement de "km")
          const match = lineBelowStripped.match(/^(\d{1,7})(?:km)?$/i);
          if (match) {
            result.kilometrage = parseInt(match[1], 10);
            break;
          }
        }
      }
      if (result.kilometrage) break;
    }
  }
  // Fallback
  if (!result.kilometrage) {
    const kmMatch = cleanText.match(/(\d{1,7})\s*km/i) || cleanText.match(/kilométrage\s*:?\s*(\d{1,7})/i);
    if (kmMatch) result.kilometrage = parseInt(kmMatch[1]);
  }

  // 5. Lettre Moteur (juste en dessous de l'inscription "lettre moteur")
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (lineLower.includes('lettre') && lineLower.includes('moteur')) {
      // On regarde strictement sur les 2 lignes en dessous
      const nextLines = lines.slice(i + 1, i + 3).join(' ');
      const match = nextLines.match(/\b([A-Z]{3,4})\b/);
      if (match && !['TMB', 'WVW', 'VSS', 'SEAT', 'AUTO', 'KIL'].includes(match[1].toUpperCase())) {
        result.lettreMoteur = match[1].toUpperCase();
        break;
      }
    }
  }

  // 6. Type et Modèle (modèle en dessous du type)
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (lineLower.includes('type')) {
      let typeNum = '';
      let typeLineIndex = i;
      
      const typeMatch = lines[i].match(/type\s*[:\-]?\s*([A-Z0-9]{3,6})/i);
      if (typeMatch) {
        typeNum = typeMatch[1].toUpperCase();
      } else {
        const nextLineMatch = (lines[i + 1] || '').match(/^([A-Z0-9]{3,6})$/i);
        if (nextLineMatch) {
          typeNum = nextLineMatch[1].toUpperCase();
          typeLineIndex = i + 1;
        }
      }

      if (typeNum) {
        result.typeVehicule = typeNum;
        // Le modèle est juste en dessous du numéro de type
        for (let j = 1; j <= 2; j++) {
          const nextLine = (lines[typeLineIndex + j] || '').trim();
          if (nextLine.length >= 2 && nextLine.length < 30 && !nextLine.match(/^[0-9]+$/)) {
            result.modele = nextLine;
            break;
          }
        }
        break;
      }
    }
  }

  // 7. Marque
  const marques = ['Volkswagen', 'SEAT', 'CUPRA', 'Skoda'];
  for (const marque of marques) {
    if (text.toLowerCase().includes(marque.toLowerCase())) {
      result.marque = marque;
      break;
    }
  }

  console.log('--- RESULTAT ANALYSE ---', result);
  return result;
}

async function extractRawTextFromPDF(buffer) {
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();
  await parser.destroy();
  return data.text;
}

module.exports = { extractDataFromPDF, extractRawTextFromPDF };
