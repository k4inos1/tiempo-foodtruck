import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// A4 dimensions: 595.28 x 841.89 points
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 0, bottom: 0, left: 0, right: 0 },
  autoFirstPage: true
});

const outputPath = path.join(__dirname, 'Carta_Tiempo_Unica_Pagina.pdf');
const flyerImagePath = path.join(__dirname, 'flyer.jpg');

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Embed image full bleed fitting A4
doc.image(flyerImagePath, 0, 0, {
  fit: [doc.page.width, doc.page.height],
  align: 'center',
  valign: 'center'
});

doc.end();
console.log('PDF con la imagen original generado exitosamente.');
