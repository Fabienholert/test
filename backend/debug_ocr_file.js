const fs = require('fs');
const path = require('path');
const { extractDataFromPDF } = require('./utils/ocr');

async function debug() {
  const uploadsDir = './uploads';
  const files = fs.readdirSync(uploadsDir)
    .filter(f => f.endsWith('.pdf'))
    .map(f => ({ name: f, time: fs.statSync(path.join(uploadsDir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);

  if (files.length === 0) {
    console.error('Aucun PDF trouvé dans uploads/');
    return;
  }

  const latestFile = path.join(uploadsDir, files[0].name);
  console.log('Analyse du fichier:', latestFile);
  
  const buffer = fs.readFileSync(latestFile);
  const result = await extractDataFromPDF(buffer);
  console.log('Final Result for debug:', result);
}

debug();
