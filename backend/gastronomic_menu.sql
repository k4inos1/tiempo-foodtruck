DELETE FROM menu_items;

INSERT INTO menu_items (id, name, description, price, available, category, sector, brand) VALUES
-- Entradas
('m10', 'Tequeños Venezolanos', '6 deditos de queso llanero envueltos en masa crujiente.', 4500, 1, 'Entradas', 'Cocina', 'Tiempo (Propia)'),
('m11', 'Empanaditas de Mechada', '5 mini empanadas fritas rellenas de nuestra mechada.', 4000, 1, 'Entradas', 'Cocina', 'Tiempo (Propia)'),

-- Platos Fuertes (Completos, Sandwiches & Burgers)
('m1', 'Completo Italiano', 'Vienesa, tomate, palta y mayo casera en pan de masa madre.', 3000, 1, 'Completos', 'Cocina', 'Tiempo (Propia)'),
('m12', 'Completo Dinámico', 'Vienesa, salsa americana, tomate, palta y chucrut.', 3200, 1, 'Completos', 'Cocina', 'Tiempo (Propia)'),
('m2', 'Sándwich de Mechada', 'Carne mechada, queso fundido y cebolla caramelizada.', 5500, 1, 'Sandwiches', 'Cocina', 'Tiempo (Propia)'),
('m13', 'Lomito Palta Mayo', 'Finas láminas de cerdo braseado, palta hass y mayo.', 5000, 1, 'Sandwiches', 'Cocina', 'Tiempo (Propia)'),
('m14', 'Smash Burger Trufada', 'Doble smash (180g), queso cheddar, tocino, mayo trufada.', 7500, 1, 'Hamburguesas', 'Cocina', 'Tiempo (Propia)'),

-- Acompañamientos
('m3', 'Papas Fritas Tiempo', 'Papas rústicas con salsa cheddar, tocino y ciboulette.', 4500, 1, 'Acompañamientos', 'Cocina', 'Tiempo (Propia)'),

-- Postres
('m15', 'Volcán de Chocolate', 'Bizcocho fundido en su interior, con helado de vainilla.', 3500, 1, 'Postres', 'Cocina', 'Nestlé'),
('m16', 'Cheesecake Frutos Rojos', 'New York Cheesecake con mermelada de berries.', 3800, 1, 'Postres', 'Cocina', 'Tiempo (Propia)'),

-- Cafetería
('m4', 'Té Ceylán', 'Té negro clásico intenso, con limón o leche.', 1500, 1, 'Cafetería', 'Barra', 'Supremo'),
('m5', 'Espresso Doble', 'Café de especialidad, grano 100% arábica tostado.', 2200, 1, 'Cafetería', 'Barra', 'Nescafé'),
('m6', 'Milo Caliente', 'La clásica bebida de malta y chocolate.', 2500, 1, 'Cafetería', 'Barra', 'Nestlé'),

-- Bebidas & Coctelería Sin Alcohol
('m7', 'Coca-Cola (Lata)', 'Lata 350ml bien helada.', 1500, 1, 'Bebidas Frías', 'Refrigerador', 'The Coca-Cola Company'),
('m8', 'Sprite Zero (Lata)', 'Lata 350ml bien helada.', 1500, 1, 'Bebidas Frías', 'Refrigerador', 'The Coca-Cola Company'),
('m17', 'Limonada Menta Jengibre', 'Limonada natural con menta fresca y jengibre.', 2800, 1, 'Mocktails', 'Barra', 'Tiempo (Propia)'),
('m18', 'Mojito Frambuesa', 'Limón sutil, puré de frambuesas, hielo y soda.', 3200, 1, 'Mocktails', 'Barra', 'Tiempo (Propia)');
