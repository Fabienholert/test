const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'uploads', 'Feuille de calcul sans titre.xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Lignes 1 à 20 (raw):');
data.slice(0, 20).forEach((row, i) => console.log(i, row));
