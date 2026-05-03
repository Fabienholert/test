import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Setup pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Envoyer le PDF au serveur pour analyse OCR côté serveur (OPTIMISÉ)
 * Le serveur effectue l'OCR avec Tesseract pour de meilleurs résultats
 */
export async function performServerSideOCR(file) {
  try {
    const formData = new FormData();
    formData.append('documentPdfFile', file);

    const response = await fetch('/api/dossiers/analyze', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(60000) // 60s timeout
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Erreur OCR serveur:', error);
    throw error;
  }
}

/**
 * Extraire texte brut du PDF (pour MCQ)
 */
export async function extractTextFromPDF(file) {
  try {
    const formData = new FormData();
    formData.append('ficheMCQFile', file);

    const response = await fetch('/api/dossiers/analyzeMCQ', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(60000)
    });

    if (!response.ok) {
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('❌ Erreur extraction texte:', error);
    throw error;
  }
}

/**
 * Parser des données depuis le texte extrait
 * Utilitaire côté client pour traitement rapide
 */
export function parseDossierText(text) {
  const result = {};
  
  const cleanText = text.replace(/\s\s+/g, ' ');
  const noSpaceText = text.replace(/\s+/g, '');
  
  // 1. OR N°
  const orMatch = cleanText.match(/\b(14\d{4})\b/) || cleanText.match(/\b(\d{6})\b/);
  if (orMatch) {
    result.numero = orMatch[1];
    const textAfterOr = text.substring(text.indexOf(orMatch[1]));
    const nextDate = textAfterOr.match(/\d{2}[\/\.-]\d{2}[\/\.-]\d{4}/);
    if (nextDate) {
      result.dateImpression = nextDate[0].replace(/[\.-]/g, '/');
      result.dateEntree = result.dateImpression; 
    }
  }

  // 2. Châssis (VIN)
  const vinMatch = noSpaceText.match(/(VSS|TMB|WVW)[A-Z0-9]{14}/i);
  if (vinMatch) {
    result.vin = vinMatch[0].toUpperCase();
    const prefix = vinMatch[1].toUpperCase();
    result.marque = prefix === 'WVW' ? 'Volkswagen' : prefix === 'TMB' ? 'Škoda' : 'SEAT';
  }

  // 3. Immatriculation
  const immatMatch = cleanText.match(/[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}/i) || 
                     cleanText.match(/\d{3}\s[A-Z]{2,3}\s\d{2}/i);
  if (immatMatch) {
    result.immatriculation = immatMatch[0].toUpperCase().replace(/[-\s]/g, '-');
  }

  // 4. Kilométrage
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().match(/\bkm\b/) || lines[i].toLowerCase().includes('kilom')) {
      for (let j = 1; j <= 2; j++) {
        if (lines[i + j]) {
          const lineBelowStripped = lines[i + j].replace(/\s+/g, '').replace(/[Oo]/g, '0');
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

  return result;
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
