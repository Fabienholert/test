import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Setup pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function performClientSideOCR(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  const worker = await createWorker('fra'); // Use French for "Ordre de réparation"

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // High scale for better OCR
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    const { data: { text } } = await worker.recognize(canvas);
    fullText += text + '\n';
  }

  await worker.terminate();
  return fullText;
}

export function parseDossierText(text) {
  const result = {};
  
  // VIN (17 chars)
  const vinMatch = text.match(/[A-HJ-NPR-Z0-9]{17}/i);
  if (vinMatch) result.vin = vinMatch[0].toUpperCase();
  
  // Immat (AA-123-AA or old formats)
  const immatMatch = text.match(/[A-Z]{2}-\d{3}-[A-Z]{2}/i) || text.match(/\d{3}\s[A-Z]{2,3}\s\d{2}/i);
  if (immatMatch) result.immatriculation = immatMatch[0].toUpperCase().replace(/\s+/g, '-');
  
  // KM
  const kmMatch = text.match(/(\d{1,7})\s*km/i);
  if (kmMatch) result.kilometrage = parseInt(kmMatch[1]);

  // Lettre Moteur (Ex: CXXB, DADA)
  const moteurMatch = text.match(/moteur\s*:\s*([A-Z0-9]{3,4})/i) || text.match(/\b([A-Z]{3,4})\b(?=.*moteur)/i);
  if (moteurMatch) result.lettreMoteur = moteurMatch[1].toUpperCase();

  // Type (Ex: 5G1)
  const typeMatch = text.match(/type\s*:\s*([A-Z0-9]{3})/i);
  if (typeMatch) result.typeVehicule = typeMatch[1].toUpperCase();
  
  // Date
  const dateMatch = text.match(/\d{2}\/\d{2}\/\d{4}/);
  if (dateMatch) result.dateEntree = dateMatch[0];

  return result;
}
