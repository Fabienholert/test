import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { createWorker } from 'tesseract.js';

// Setup pdf.js worker - Stable version with high compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export async function performClientSideOCR(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  const worker = await createWorker('fra', 1, {
    logger: m => console.log('OCR Progress:', m.status, Math.round(m.progress * 100) + '%')
  }); 

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    
    // 1. Essayer d'extraire le texte numérique (si le PDF n'est pas un scan)
    const textContent = await page.getTextContent();
    const digitalText = textContent.items.map(item => item.str).join(' ');
    
    if (digitalText.trim().length > 20) {
      console.log(`Page ${i}: Texte numérique détecté (plus précis).`);
      fullText += digitalText + '\n';
    } else {
      // 2. Fallback OCR si c'est un scan (image)
      console.log(`Page ${i}: Aucun texte numérique. Lancement de l'OCR...`);
      const viewport = page.getViewport({ scale: 3.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      const { data: { text } } = await worker.recognize(canvas);
      fullText += text + '\n';
    }
  }

  await worker.terminate();
  return fullText;
}

export function parseDossierText(text) {
  const result = {};
  console.log('--- DEBUT DU PARSING SEQUENTIEL ---');
  
  const cleanText = text.replace(/\s\s+/g, ' ');
  const noSpaceText = text.replace(/\s+/g, '');
  
  // 1. OR N° (6 chiffres, généralement commence par 14)
  const orMatch = cleanText.match(/\b(14\d{4})\b/) || cleanText.match(/\b(\d{6})\b/);
  if (orMatch) {
    result.numero = orMatch[1];
    console.log('OR N° trouvé:', result.numero);
    
    // On essaie de trouver la date d'impression juste APRES le OR N° dans le texte
    const textAfterOr = text.substring(text.indexOf(orMatch[1]));
    const nextDate = textAfterOr.match(/\d{2}[\/\.-]\d{2}[\/\.-]\d{4}/);
    if (nextDate) {
      result.dateImpression = nextDate[0].replace(/[\.-]/g, '/');
      // Pour le formulaire, la date d'entrée est souvent la même ou proche
      result.dateEntree = result.dateImpression; 
    }
  }

  // 2. Châssis (VSS=SEAT/CUPRA, TMB=Škoda, WVW=Volkswagen)
  const vinMatch = noSpaceText.match(/(VSS|TMB|WVW)[A-Z0-9]{14}/i);
  if (vinMatch) {
    result.vin = vinMatch[0].toUpperCase();
    const prefix = vinMatch[1].toUpperCase();
    if (prefix === 'WVW') {
      result.marque = 'Volkswagen';
    } else if (prefix === 'TMB') {
      result.marque = 'Škoda';
    } else if (prefix === 'VSS') {
      result.marque = 'SEAT'; // SEAT ou CUPRA — à vérifier manuellement si besoin
    }
    console.log('Châssis trouvé:', result.vin, '→ Marque détectée:', result.marque);
  }

  // 3. Immatriculation (Souvent après le châssis selon l'utilisateur)
  const immatMatch = cleanText.match(/[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}/i) || 
                     cleanText.match(/\d{3}\s[A-Z]{2,3}\s\d{2}/i);
  if (immatMatch) {
    result.immatriculation = immatMatch[0].toUpperCase().replace(/[-\s]/g, '-');
  }

  // 3.5 Kilométrage (juste en dessous de KM, souvent manuscrit)
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    // On cherche le mot isolé "km" ou "kilom"
    if (lineLower.match(/\bkm\b/) || lineLower.includes('kilom')) {
      // On regarde la ligne suivante (ou la 2e si ligne vide)
      for (let j = 1; j <= 2; j++) {
        if (lines[i + j]) {
          // Retire tous les espaces (ex: "12 000" -> "12000") et corrige 'o' lu au lieu de 0
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
  if (!result.kilometrage) {
    const kmMatch = cleanText.match(/(\d{1,7})\s*km/i) || cleanText.match(/kilométrage\s*:?\s*(\d{1,7})/i);
    if (kmMatch) result.kilometrage = parseInt(kmMatch[1]);
  }

  // 4. Lettre Moteur et Modèle (modèle juste après la lettre moteur)
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (lineLower.includes('lettre') && lineLower.includes('moteur')) {
      // On regarde la ligne courante et les 2 en dessous
      const searchLines = lines.slice(i, i + 3);
      for (let j = 0; j < searchLines.length; j++) {
        const line = searchLines[j];
        const match = line.match(/\b([A-Z]{3,4})\b/);
        // Exclure des mots courants
        if (match && !['TMB', 'WVW', 'VSS', 'SEAT', 'AUTO', 'KIL', 'MOT', 'LETT', 'TYPE'].includes(match[1].toUpperCase())) {
          result.lettreMoteur = match[1].toUpperCase();
          
          // Le modèle est juste après les lettres moteurs
          let afterLetters = line.substring(match.index + match[0].length).trim();
          afterLetters = afterLetters.replace(/^(?:modèle|model)?\s*[:\/\-]*\s*/i, '').trim();
          
          if (afterLetters && afterLetters.length >= 2) {
            result.modele = afterLetters;
          } else {
            // Si vide, on regarde la ligne suivante
            const nextLine = (searchLines[j + 1] || '').trim();
            if (nextLine && nextLine.length >= 2) {
              result.modele = nextLine.replace(/^(?:modèle|model)?\s*[:\/\-]*\s*/i, '').trim();
            }
          }
          break;
        }
      }
      if (result.lettreMoteur) break;
    }
  }

  // 5. Type
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (lineLower.includes('type')) {
      const typeMatch = lines[i].match(/type\s*[:\-]?\s*([A-Z0-9]{3,6})/i);
      if (typeMatch) {
        result.typeVehicule = typeMatch[1].toUpperCase();
        break;
      } else {
        const nextLineMatch = (lines[i + 1] || '').match(/^([A-Z0-9]{3,6})$/i);
        if (nextLineMatch) {
          result.typeVehicule = nextLineMatch[1].toUpperCase();
          break;
        }
      }
    }
  }

  // 7. DISS (peut y en avoir plusieurs - on capture le code complet ex: DISS-2024-001)
  // On cherche "DISS" suivi éventuellement d'un espace/tiret et d'un numéro
  const dissMatches = [...text.matchAll(/DISS[\s\-:]*([\w\-]+)/gi)];
  if (dissMatches.length > 0) {
    // Pour chaque match, on reconstitue le code complet "DISS-XXXX"
    result.numDISS = dissMatches.map(m => {
      const num = m[1]?.trim().toUpperCase();
      return num && !num.startsWith('DISS') ? `DISS-${num}` : num || 'DISS';
    });
    result.isDISS = true;
    console.log('DISS trouvés:', result.numDISS);

    // Récupérer le texte juste AVANT le premier DISS
    const firstDissIndex = text.toLowerCase().indexOf('diss');
    const travauxKeywords = ['travaux', 'travail', 'intervention', 'remarque', 'observations', 'défaut', 'panne'];
    let travauxIndex = -1;
    for (const kw of travauxKeywords) {
      const idx = text.toLowerCase().lastIndexOf(kw, firstDissIndex);
      if (idx !== -1 && idx > travauxIndex) travauxIndex = idx;
    }

    if (travauxIndex !== -1) {
      const rawDesc = text.substring(travauxIndex, firstDissIndex).trim();
      result.descriptionPanne = rawDesc.replace(/\s+/g, ' ').substring(0, 1000);
      console.log('Description extraite:', result.descriptionPanne.substring(0, 100) + '...');
    }
  }

  return result;
}
