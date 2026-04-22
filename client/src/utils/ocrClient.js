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
  
  // 1. OR N° (Commence par 14)
  const orMatch = noSpaceText.match(/14[0-9]{4,10}/);
  if (orMatch) {
    result.numero = orMatch[0];
    console.log('OR N° trouvé:', result.numero);
    
    // On essaie de trouver la date d'impression juste APRES le OR N° dans le texte
    const textAfterOr = text.substring(text.indexOf(orMatch[0]));
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

  // 4. Lettre Moteur (3-4 caractères majuscules isolés ou après "Moteur")
  const moteurMatch = cleanText.match(/moteur\s*[:\s]+([A-Z0-9]{3,4})/i) || 
                      cleanText.match(/\b([A-Z]{3,4})\b/); // Très risqué, on préfère avec contexte
  if (moteurMatch) {
    result.lettreMoteur = moteurMatch[1].toUpperCase();
  }

  // 5. Type & Modèle
  const typeMatch = cleanText.match(/type\s*[:\s]+([A-Z0-9]{3,6})/i);
  if (typeMatch) result.typeVehicule = typeMatch[1].toUpperCase();

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
