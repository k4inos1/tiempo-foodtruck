DROP TABLE IF EXISTS menu_items;

CREATE TABLE menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    available INTEGER DEFAULT 1,
    image_url TEXT,
    category TEXT,
    sector TEXT,
    brand TEXT
);

INSERT INTO menu_items (id, name, description, price, category, sector, brand) VALUES
('m1', 'Completo Italiano', 'Vienesa, tomate fresco, palta y mayo casera.', 2500, 'Completos', 'Cocina', 'Tiempo (Propia)'),
('m2', 'Sándwich de Mechada', 'Carne mechada a fuego lento, queso fundido.', 4500, 'Sandwiches', 'Cocina', 'Tiempo (Propia)'),
('m3', 'Papas Fritas Tiempo', 'Papas fritas rústicas con más aderezos especiales.', 3500, 'Acompañamientos', 'Cocina', 'Tiempo (Propia)'),
('m4', 'Té Ceylán', 'Té negro clásico intenso, servido con limón.', 1500, 'Bebidas Calientes', 'Barra', 'Supremo'),
('m5', 'Café de Grano', 'Espresso o Americano de grano tostado colombiano.', 2000, 'Bebidas Calientes', 'Barra', 'Nescafé'),
('m6', 'Milo Caliente', 'La clásica bebida de malta y chocolate.', 2200, 'Bebidas Calientes', 'Barra', 'Nestlé'),
('m7', 'Coca-Cola (Lata)', 'Lata 350ml bien helada.', 1500, 'Bebidas Frías', 'Refrigerador', 'The Coca-Cola Company'),
('m8', 'Sprite Zero (Lata)', 'Lata 350ml bien helada.', 1500, 'Bebidas Frías', 'Refrigerador', 'The Coca-Cola Company');
