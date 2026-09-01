const PDFDocument = require('pdfkit');
const fs = require('fs');

const menuItems = [
  { category: 'SÁNDWICHES', note: '* Disponibles en pan de marraqueta o pan de hamburguesa', items: [
    { name: 'Sándwich Italiano', desc: 'Carne, tomate fresco, palta hass y mayo casera.', price: 4500 },
    { name: 'Sándwich de Pollo', desc: 'Filete de pollo a la plancha, lechuga y tomate.', price: 4000 },
    { name: 'Sándwich de Mechada', desc: 'Carne mechada al jugo a fuego lento.', price: 5000 }
  ]},
  { category: 'COMPLETOS', items: [
    { name: 'Completo Italiano', desc: 'Vienesa, tomate, palta y mayo casera.', price: 2500 },
    { name: 'Completo Alemán', desc: 'Vienesa, tomate, chucrut y mayo.', price: 2500 }
  ]},
  { category: 'PARA PICAR', items: [
    { name: 'Sopaipillas', desc: 'Porción de sopaipillas tradicionales recién fritas.', price: 1500 },
    { name: 'Papas Fritas', desc: '(Próximamente)', price: 3000 }
  ]},
  { category: 'BEBESTIBLES', items: [
    { name: 'Té', desc: 'Té tradicional caliente.', price: 1000 },
    { name: 'Café', desc: 'Café caliente.', price: 1500 },
    { name: 'Bebidas Lata', desc: 'Variedad de bebidas heladas.', price: 1500 }
  ]}
];

const doc = new PDFDocument({ margin: 50, size: 'A4' });
doc.pipe(fs.createWriteStream('Carta_Tiempo_Minimalista.pdf'));

// Header (Monochrome)
doc.fillColor('#000000').fontSize(40).font('Helvetica-Bold').text('TIEMPO', 0, 50, { align: 'center' });
doc.fontSize(12).font('Helvetica').text('CARTA GASTRONÓMICA', 0, 95, { align: 'center', characterSpacing: 4 });
doc.moveTo(200, 115).lineTo(395, 115).lineWidth(1).strokeColor('#000000').stroke();

let y = 150;

menuItems.forEach(group => {
  if (y > doc.page.height - 150) {
    doc.addPage();
    y = 50;
  }
  
  // Category Title
  doc.fillColor('#000000').fontSize(16).font('Helvetica-Bold').text(group.category, 50, y);
  if (group.note) {
    doc.fillColor('#666666').fontSize(9).font('Helvetica-Oblique').text(group.note, 50, y + 20);
    y += 10;
  }
  
  doc.moveTo(50, y + 22).lineTo(doc.page.width - 50, y + 22).strokeColor('#CCCCCC').lineWidth(1).stroke();
  y += 40;

  group.items.forEach(item => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }
    
    // Item Name and Price
    doc.fillColor('#000000').fontSize(13).font('Helvetica-Bold').text(item.name, 50, y);
    doc.fillColor('#000000').fontSize(13).font('Helvetica-Bold').text('$' + item.price, 50, y, { align: 'right' });
    y += 16;
    
    // Item Description
    doc.fillColor('#333333').fontSize(10).font('Helvetica-Oblique').text(item.desc, 50, y, { width: 400 });
    y += 25;
  });
  
  y += 20;
});

// Footer
doc.fillColor('#666666').fontSize(10).font('Helvetica').text('Tiempo Foodtruck - Menú', 0, doc.page.height - 40, { align: 'center' });

doc.end();
