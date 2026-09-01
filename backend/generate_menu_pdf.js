const PDFDocument = require('pdfkit');
const fs = require('fs');

const menuItems = [
  { category: 'Entradas', items: [
    { name: 'Tequeños Venezolanos', desc: '6 deditos de queso llanero envueltos en masa crujiente.', price: 4500 },
    { name: 'Empanaditas de Mechada', desc: '5 mini empanadas fritas rellenas de nuestra mechada.', price: 4000 }
  ]},
  { category: 'Platos Fuertes', items: [
    { name: 'Completo Italiano', desc: 'Vienesa, tomate, palta y mayo casera en pan de masa madre.', price: 3000 },
    { name: 'Completo Dinámico', desc: 'Vienesa, salsa americana, tomate, palta y chucrut.', price: 3200 },
    { name: 'Sándwich de Mechada', desc: 'Carne mechada, queso fundido y cebolla caramelizada.', price: 5500 },
    { name: 'Lomito Palta Mayo', desc: 'Finas láminas de cerdo braseado, palta hass y mayo.', price: 5000 },
    { name: 'Smash Burger Trufada', desc: 'Doble smash (180g), queso cheddar, tocino, mayo trufada.', price: 7500 }
  ]},
  { category: 'Acompañamientos', items: [
    { name: 'Papas Fritas Tiempo', desc: 'Papas rústicas con salsa cheddar, tocino y ciboulette.', price: 4500 }
  ]},
  { category: 'Postres', items: [
    { name: 'Volcán de Chocolate', desc: 'Bizcocho fundido en su interior, con helado de vainilla.', price: 3500 },
    { name: 'Cheesecake Frutos Rojos', desc: 'New York Cheesecake con mermelada de berries.', price: 3800 }
  ]},
  { category: 'Cafetería & Mocktails', items: [
    { name: 'Espresso Doble', desc: 'Café de especialidad, grano 100% arábica tostado.', price: 2200 },
    { name: 'Milo Caliente', desc: 'La clásica bebida de malta y chocolate.', price: 2500 },
    { name: 'Limonada Menta Jengibre', desc: 'Limonada natural con menta fresca y jengibre.', price: 2800 },
    { name: 'Mojito Frambuesa', desc: 'Limón sutil, puré de frambuesas, hielo y soda.', price: 3200 }
  ]}
];

const doc = new PDFDocument({ margin: 50, size: 'A4' });
doc.pipe(fs.createWriteStream('Carta_Gastronomica_Tiempo.pdf'));

// Background / Header
doc.rect(0, 0, doc.page.width, 120).fill('#ea580c'); // Orange background for header
doc.fillColor('white').fontSize(36).font('Helvetica-Bold').text('TIEMPO', 0, 40, { align: 'center' });
doc.fontSize(12).font('Helvetica').text('CARTA GASTRONÓMICA', 0, 80, { align: 'center', characterSpacing: 2 });

let y = 160;

menuItems.forEach(group => {
  if (y > doc.page.height - 150) {
    doc.addPage();
    y = 50;
  }
  
  // Category Title
  doc.fillColor('#e11d48').fontSize(18).font('Helvetica-Bold').text(group.category.toUpperCase(), 50, y);
  doc.moveTo(50, y + 22).lineTo(doc.page.width - 50, y + 22).strokeColor('#e11d48').lineWidth(2).stroke();
  y += 40;

  group.items.forEach(item => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }
    
    // Item Name and Price
    doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(item.name, 50, y);
    doc.fillColor('#ea580c').fontSize(14).font('Helvetica-Bold').text('$' + item.price, 50, y, { align: 'right' });
    y += 18;
    
    // Item Description
    doc.fillColor('#64748b').fontSize(10).font('Helvetica-Oblique').text(item.desc, 50, y, { width: 400 });
    y += 25;
  });
  
  y += 20;
});

// Footer
doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('Desarrollado por Onyx - Tiempo Foodtruck', 0, doc.page.height - 40, { align: 'center' });

doc.end();
