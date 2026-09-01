import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 30, bottom: 25, left: 35, right: 35 },
  autoFirstPage: true
});

const outputPath = path.join(__dirname, 'Carta_Tiempo_Unica_Pagina.pdf');
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// HEADER
doc.fontSize(22).font('Helvetica-Bold').text('TIEMPO', { align: 'center', characterSpacing: 4 });
doc.fontSize(9).font('Helvetica-Oblique').text('para un antojo perfecto', { align: 'center' });
doc.moveDown(0.3);
doc.fontSize(14).font('Helvetica-Bold').text('NUESTRO MENÚ', { align: 'center', characterSpacing: 2 });
doc.moveDown(0.4);

// Divider line
doc.strokeColor('#222222').lineWidth(1).moveTo(35, doc.y).lineTo(560, doc.y).stroke();
doc.moveDown(0.6);

const col1Left = 35;
const col1Width = 250;
const col2Left = 310;
const col2Width = 250;

let yStart = doc.y;

// HELPER: Category Ribbon / Header
function drawCategoryHeader(title, x, y, width) {
  doc.rect(x, y, width, 16).strokeColor('#222222').lineWidth(1.5).stroke();
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000')
     .text(title, x, y + 3.5, { width: width, align: 'center', characterSpacing: 1.5 });
  return y + 22;
}

// HELPER: Menu Item
function drawItem(name, price, desc, x, y, width) {
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000')
     .text(name, x, y, { width: width - 55, lineBreak: false });
  
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#000000')
     .text(price, x + width - 50, y, { width: 50, align: 'right' });
  
  if (desc) {
    doc.fontSize(7.5).font('Helvetica').fillColor('#444444')
       .text(desc, x, y + 10.5, { width: width, lineGap: 0.5 });
    return y + 23;
  }
  return y + 14;
}

// --- COLUMNA 1 (Izquierda) ---
let y1 = yStart;

y1 = drawCategoryHeader('SANDWICHES', col1Left, y1, col1Width);
y1 = drawItem('SANDWICH MECHADA', '$3.000', 'Carne de vacuno, tomate, palta y mayo casera.', col1Left, y1, col1Width);
y1 = drawItem('SANDWICH AVE', '$3.000', 'Pollo mechada, tomate, palta y mayo casera.', col1Left, y1, col1Width);
y1 = drawItem('CHURRASCO ITALIANO', '$4.000', 'Churrasco vacuno, tomate, palta y mayo casera.', col1Left, y1, col1Width);
y1 = drawItem('LOMO', '$4.000', 'Lomo de cerdo, tomate, palta y mayo casera.', col1Left, y1, col1Width);
y1 = drawItem('BARROS LUCO', '$4.500', 'Churrasco vacuno y queso derretido.', col1Left, y1, col1Width);
y1 = drawItem('CHACARERO', '$5.000', 'Churrasco vacuno, tomate, poroto verde y mayo casera.', col1Left, y1, col1Width);

y1 += 6;
y1 = drawCategoryHeader('COMPLETOS', col1Left, y1, col1Width);
y1 = drawItem('ITALIANO', '$2.000', 'Vienesa, tomate, palta y mayo casera.', col1Left, y1, col1Width);
y1 = drawItem('ALEMÁN', '$2.000', 'Vienesa, tomate, chucrut y mayo casera.', col1Left, y1, col1Width);
y1 = drawItem('DINÁMICO', '$2.500', 'Vienesa, tomate, chucrut, palta y mayo casera.', col1Left, y1, col1Width);
y1 = drawItem('AS MECHADA', '$3.000', 'Carne mechada vacuno, tomate, palta y mayo casera.', col1Left, y1, col1Width);

// --- COLUMNA 2 (Derecha) ---
let y2 = yStart;

y2 = drawCategoryHeader('PAPAS FRITAS', col2Left, y2, col2Width);
y2 = drawItem('PORCIÓN PAPAS 250GR', '$2.000', 'Papas fritas crujientes 250gr.', col2Left, y2, col2Width);
y2 = drawItem('SALCHIPAPAS INDIVIDUAL', '$2.500', 'Papas fritas con vienesa en trozos.', col2Left, y2, col2Width);
y2 = drawItem('SALCHIPAPAS GRANDE', '$4.500', 'Papas fritas con abundante vienesa para compartir.', col2Left, y2, col2Width);

y2 += 4;
y2 = drawCategoryHeader('SOPAÍPILLAS', col2Left, y2, col2Width);
y2 = drawItem('SOPAÍPILLAS', '$500 c/u', 'Sopaipillas tradicionales fritas al momento.', col2Left, y2, col2Width);

y2 += 4;
y2 = drawCategoryHeader('BEBESTIBLES', col2Left, y2, col2Width);
y2 = drawItem('BEBIDA EN LATA', '$1.500', null, col2Left, y2, col2Width);
y2 = drawItem('AGUA MINERAL SABOR', '$1.500', null, col2Left, y2, col2Width);
y2 = drawItem('AGUA MINERAL (GAS/SIN)', '$1.500', null, col2Left, y2, col2Width);
y2 = drawItem('SCORE ENERGÉTICA', '$1.800', null, col2Left, y2, col2Width);
y2 = drawItem('TÉ SELECCIÓN', '$1.000', null, col2Left, y2, col2Width);
y2 = drawItem('CAFÉ CALIENTE', '$1.000', null, col2Left, y2, col2Width);
y2 = drawItem('MILO', '$1.000', null, col2Left, y2, col2Width);

y2 += 4;
y2 = drawCategoryHeader('AGREGADOS ($1.000 c/u)', col2Left, y2, col2Width);
doc.fontSize(7.5).font('Helvetica').fillColor('#333333')
   .text('• Champiñón   • Choclo   • Queso   • Poroto verde', col2Left, y2, { width: col2Width, align: 'center' });

// FOOTER
const maxY = Math.max(y1, y2) + 16;
doc.strokeColor('#777777').lineWidth(0.5).moveTo(35, maxY).lineTo(560, maxY).stroke();
doc.fontSize(7.5).font('Helvetica').fillColor('#555555')
   .text('TIEMPO FOODTRUCK — Ingredientes frescos y preparación artesanal en el momento.', 35, maxY + 6, { align: 'center' });

doc.end();
console.log('PDF monocromo sincronizado exitosamente con el volante.');
