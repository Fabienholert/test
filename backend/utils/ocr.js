const pdf = require("pdf-parse");

async function extractDataFromPDF(buffer) {
  const data = await pdf(buffer);
  const text = data.text || "";

  console.log("--- TEXTE EXTRAIT DU PDF (longueur:", text.length, ") ---");
  console.log(text.substring(0, 500) + "...");

  const result = {};

  // Nettoyage modéré pour garder les slashs des dates et tirets
  // On garde aussi les points et virgules pour le kilométrage
  const cleanText = text.replace(/[^A-Z0-9\s\/.,-]/gi, " ");
  const noSpaceText = text.replace(/\s/g, "");

  // 1. OR N° (6 chiffres, généralement commence par 14)
  const orMatch =
    cleanText.match(/\b(14\d{4,6})\b/) || cleanText.match(/\b(\d{6,8})\b/);
  if (orMatch) result.numero = orMatch[1].trim();

  // 2. Châssis (VIN - 17 caractères, commence par VSS, TMB ou WVW)
  const vinMatch = noSpaceText.match(/(VSS|TMB|WVW)[A-Z0-9]{14}/i);
  if (vinMatch) result.vin = vinMatch[0].toUpperCase();

  // 3. Immatriculation & Dates
  const immatMatch =
    cleanText.match(/\b[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}\b/i) ||
    cleanText.match(/\b\d{3}\s[A-Z]{2,3}\s\d{2}\b/i);
  if (immatMatch)
    result.immatriculation = immatMatch[0].toUpperCase().replace(/[-\s]/g, "-");

  // Dates (format DD/MM/YYYY)
  const dateMatches = cleanText.match(/\d{2}\/\d{2}\/\d{4}/g);
  if (dateMatches && dateMatches.length > 0) {
    // Souvent la première date est l'impression et la deuxième l'entrée ou inversement selon l'OR
    result.dateImpression = dateMatches[0];
    if (dateMatches.length > 1) result.dateEntree = dateMatches[1];
    else result.dateEntree = dateMatches[0];
  }

  // Recherche spécifique de la date d'entrée si libellée
  const entryDateMatch = text.match(
    /(?:entree|entrée|reçu|le)\s*[:\-]?\s*(\d{2}\/\d{2}\/\d{4})/i,
  );
  if (entryDateMatch) result.dateEntree = entryDateMatch[1];

  // 4. Kilométrage (juste en dessous de KM, souvent manuscrit)
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    // On cherche le mot isolé "km" ou "kilom"
    if (lineLower.match(/\bkm\b/) || lineLower.includes("kilom")) {
      // On regarde la ligne suivante (ou la 2e si ligne vide)
      for (let j = 1; j <= 2; j++) {
        if (lines[i + j]) {
          // Retire tous les espaces (ex: "12 000" -> "12000") et corrige les 'o' manuscrits lus au lieu de zéros
          let lineBelowStripped = lines[i + j]
            .trim()
            .replace(/[\s.,]+/g, "")
            .replace(/[Oo]/g, "0");
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
    const kmMatch =
      cleanText.replace(/\s/g, "").match(/(\d{1,7})km/i) ||
      cleanText.match(/(?:kilométrage|km)\s*[:\-]?\s*(\d{1,7})/i);
    if (kmMatch) result.kilometrage = parseInt(kmMatch[1]);
  }

  // 5. Lettre Moteur et Modèle (modèle juste après la lettre moteur)
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (lineLower.includes("moteur") || lineLower.includes("type/lb")) {
      // On regarde la ligne courante et les 2 en dessous
      const searchLines = lines.slice(i, i + 3);
      for (let j = 0; j < searchLines.length; j++) {
        const line = searchLines[j];
        const match = line.match(/\b([A-Z]{3,4})\b/);
        // Exclure des mots courants
        if (
          match &&
          ![
            "TMB",
            "WVW",
            "VSS",
            "SEAT",
            "AUTO",
            "KIL",
            "MOT",
            "LETT",
            "TYPE",
          ].includes(match[1].toUpperCase())
        ) {
          result.lettreMoteur = match[1].toUpperCase();

          // Le modèle est juste après les lettres moteurs
          let afterLetters = line
            .substring(match.index + match[0].length)
            .trim();
          afterLetters = afterLetters
            .replace(/^(?:modèle|model)?\s*[:\/\-]*\s*/i, "")
            .trim();

          if (afterLetters && afterLetters.length >= 2) {
            result.modele = afterLetters;
          } else {
            // Si vide, on regarde la ligne suivante
            const nextLine = (searchLines[j + 1] || "").trim();
            if (nextLine && nextLine.length >= 2) {
              result.modele = nextLine
                .replace(/^(?:modèle|model)?\s*[:\/\-]*\s*/i, "")
                .trim();
            }
          }
          break;
        }
      }
      if (result.lettreMoteur) break;
    }
  }

  // 6. Type
  for (let i = 0; i < lines.length; i++) {
    const lineLower = lines[i].toLowerCase();
    if (lineLower.includes("type")) {
      const typeMatch = lines[i].match(/type\s*[:\-]?\s*([A-Z0-9]{3,6})/i);
      if (typeMatch) {
        result.typeVehicule = typeMatch[1].toUpperCase();
        break;
      } else {
        const nextLineMatch = (lines[i + 1] || "").match(/^([A-Z0-9]{3,6})$/i);
        if (nextLineMatch) {
          result.typeVehicule = nextLineMatch[1].toUpperCase();
          break;
        }
      }
    }
  }

  // 7. Marque
  const marques = ["Volkswagen", "SEAT", "CUPRA", "Skoda"];
  for (const marque of marques) {
    if (text.toLowerCase().includes(marque.toLowerCase())) {
      result.marque = marque;
      break;
    }
  }

  // 8. DISS (recherche de patterns type DISS-XXXX)
  const dissMatches = [...text.matchAll(/DISS[\s-]*([A-Z0-9-]+)/gi)];
  if (dissMatches.length > 0) {
    result.numDISS = dissMatches.map((m) => m[1].trim().toUpperCase());
    result.isDISS = true;
  }

  console.log("--- RESULTAT ANALYSE ---", result);
  result.lastExtractedText = text; // Utile pour le debug frontend
  return result;
}

async function extractRawTextFromPDF(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

module.exports = { extractDataFromPDF, extractRawTextFromPDF };
