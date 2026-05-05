const { createWorker } = require("tesseract.js");
const pdfParse = require("pdf-parse");

// Function to extract raw text from PDF (using pdf-parse for digital text, Tesseract for scanned)
async function extractRawTextFromPDF(buffer) {
  console.log(
    " début de l'extraction du texte (Taille buffer:",
    buffer.length,
    ")",
  );

  try {
    // 1. Tentative d'extraction numérique (Rapide et léger)
    if (typeof pdfParse !== "function") {
      console.error("❌ Erreur: pdf-parse n'est pas chargé comme une fonction");
      throw new Error("Moteur PDF mal configuré sur le serveur.");
    }

    const data = await pdfParse(buffer);
    const text = data.text ? data.text.trim() : "";

    if (text.length > 20) {
      console.log(
        "✅ Texte numérique extrait avec succès (",
        text.length,
        "caractères)",
      );
      return text;
    }

    console.log("⚠️ Texte numérique trop court, passage à l'OCR...");
  } catch (digitalErr) {
    console.warn("❌ Échec extraction numérique:", digitalErr.message);
  }

  // 2. Fallback OCR (Attention: Tesseract.js nécessite une image, pas un PDF)
  // Si le PDF est un scan, Tesseract.js ne pourra pas le lire directement depuis le buffer PDF.
  // Pour éviter un crash (502), nous allons essayer de gérer le worker proprement.
  let worker = null;
  try {
    console.log(
      "🚀 Lancement OCR Tesseract (ceci peut être gourmand en RAM)...",
    );
    worker = await createWorker("fra");

    // Note: Si 'buffer' est un PDF, recognize() risque d'échouer ou de crash le serveur.
    // Idéalement, il faudrait convertir le PDF en image ici.
    const {
      data: { text },
    } = await worker.recognize(buffer);

    await worker.terminate();
    return text || "";
  } catch (ocrErr) {
    console.error("❌ Échec OCR Tesseract:", ocrErr.message);
    if (worker) await worker.terminate();
    return ""; // Retourne vide plutôt que de faire crash le serveur
  }
}

// Function to parse extracted text and extract specific dossier data
function parseDossierText(text) {
  const result = {};
  console.log("--- DEBUT DU PARSING DU TEXTE ---");

  // Basic cleanup: remove double spaces, etc.
  const cleanText = text.replace(/\s\s+/g, " ");
  const noSpaceText = text.replace(/\s+/g, ""); // Text without any spaces for long codes

  // VIN (17 chars) - Search in text without spaces as OCR often adds them
  const vinMatch = noSpaceText.match(/[A-HJ-NPR-Z0-9]{17}/i);
  if (vinMatch) {
    result.vin = vinMatch[0].toUpperCase();
    console.log("VIN trouvé:", result.vin);
  }

  // Immat (AA-123-AA or AA 123 AA or AA123AA)
  const immatMatch =
    cleanText.match(/[A-Z]{2}[-\s]?\d{3}[-\s]?[A-Z]{2}/i) ||
    cleanText.match(/\d{3}\s[A-Z]{2,3}\s\d{2}/i);
  if (immatMatch) {
    result.immatriculation = immatMatch[0].toUpperCase().replace(/[-\s]/g, "-");
    // Ensure AA-123-AA format
    if (result.immatriculation.length === 7) {
      result.immatriculation =
        result.immatriculation.slice(0, 2) +
        "-" +
        result.immatriculation.slice(2, 5) +
        "-" +
        result.immatriculation.slice(5);
    }
    console.log("Immat trouvée:", result.immatriculation);
  }

  // KM
  const kmMatch =
    cleanText.match(/(\d{1,7})\s*km/i) ||
    cleanText.match(/kilométrage\s*:?\s*(\d{1,7})/i);
  if (kmMatch) {
    result.kilometrage = parseInt(kmMatch[1]);
    console.log("KM trouvé:", result.kilometrage);
  }

  // Lettre Moteur (Ex: CXXB, DADA)
  const moteurMatch =
    cleanText.match(/moteur\s*:\s*([A-Z0-9]{3,4})/i) ||
    cleanText.match(/\b([A-Z]{3,4})\b(?=.*moteur)/i);
  if (moteurMatch) {
    result.lettreMoteur = moteurMatch[1].toUpperCase();
    console.log("Moteur trouvé:", result.lettreMoteur);
  }

  // Type (Ex: 5G1)
  const typeMatch =
    cleanText.match(/type\s*:\s*([A-Z0-9]{3})/i) ||
    cleanText.match(/type\s+V[HÉE]H\s*:\s*([A-Z0-9]{3})/i);
  if (typeMatch) {
    result.typeVehicule = typeMatch[1].toUpperCase();
    console.log("Type trouvé:", result.typeVehicule);
  }

  // Date Entree (JJ/MM/AAAA)
  const dateEntreeMatch = cleanText.match(
    /(?:date d'entrée|date entrée|date de réception)\s*[:\-\s]*(\d{2}\/\d{2}\/\d{4})/i,
  );
  if (dateEntreeMatch) {
    result.dateEntree = dateEntreeMatch[1];
    console.log("Date Entrée trouvée:", result.dateEntree);
  }

  // Date Impression (JJ/MM/AAAA)
  const dateImpressionMatch = cleanText.match(
    /(?:date d'impression|date impression)\s*[:\-\s]*(\d{2}\/\d{2}\/\d{4})/i,
  );
  if (dateImpressionMatch) {
    result.dateImpression = dateImpressionMatch[1];
    console.log("Date Impression trouvée:", result.dateImpression);
  }

  // Numero OR (Order Repair Number)
  const numeroORMatch = cleanText.match(
    /(?:OR N°|OR N|N° OR|Numéro OR)\s*[:\-\s]*([A-Z0-9\-\/]{3,})/i,
  );
  if (numeroORMatch) {
    result.numero = numeroORMatch[1].trim();
    console.log("Numéro OR trouvé:", result.numero);
  }

  // Marque (Volkswagen, SEAT, CUPRA, Škoda)
  const marqueMatch = cleanText.match(/(Volkswagen|SEAT|CUPRA|Škoda)/i);
  if (marqueMatch) {
    result.marque = marqueMatch[1];
    console.log("Marque trouvée:", result.marque);
  }

  // DISS (if present, and number)
  const dissMatch = cleanText.match(
    /(DISS|D.I.S.S.)\s*[:\-\s]*([A-Z0-9\-\/]+)/i,
  );
  if (dissMatch) {
    result.isDISS = true;
    // Assuming numDISS can be an array of strings
    result.numDISS = [dissMatch[2].trim()]; // For now, just take the first one found
    console.log("DISS trouvé:", result.numDISS);
  }

  // Description Panne
  const descriptionPanneMatch = cleanText.match(
    /(?:description de la panne|description panne|panne)\s*[:\-\s]*(.+?)(?=(?:VIN|Immatriculation|Kilométrage|Date d'entrée|Date impression|Moteur|Type|DISS|OR N°|$))/is,
  );
  if (descriptionPanneMatch) {
    result.descriptionPanne = descriptionPanneMatch[1].trim();
    console.log("Description Panne trouvée:", result.descriptionPanne);
  }

  result.lastExtractedText = text; // Keep the raw text for debugging

  return result;
}

// Main function for analyze endpoint
async function extractDataFromPDF(buffer) {
  const rawText = await extractRawTextFromPDF(buffer);
  return parseDossierText(rawText);
}

module.exports = {
  extractDataFromPDF,
  extractRawTextFromPDF,
  parseDossierText, // Export for potential testing or other uses
};
