-- Recreate menu_items schema with image_url support
DROP TABLE IF EXISTS menu_items;

CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  available INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT 'Sector Concepción, Chile',
  brand TEXT NOT NULL DEFAULT 'Tiempo',
  image_url TEXT
);

INSERT INTO menu_items (id, name, description, price, available, category, sector, brand, image_url) VALUES
-- SANDWICHES
('sw-mechada', 'SANDWICH MECHADA', 'Carne de vacuno, tomate, palta y mayo casera.', 3000, 1, 'SANDWICHES', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80'),
('sw-ave', 'SANDWICH AVE', 'Pollo mechada, tomate, palta y mayo casera.', 3000, 1, 'SANDWICHES', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80'),
('sw-churrasco', 'CHURRASCO ITALIANO', 'Churrasco vacuno, tomate, palta y mayo casera.', 4000, 1, 'SANDWICHES', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80'),
('sw-lomo', 'LOMO', 'Lomo de cerdo, tomate, palta y mayo casera.', 4000, 1, 'SANDWICHES', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80'),
('sw-luco', 'BARROS LUCO', 'Churrasco vacuno y queso derretido.', 4500, 1, 'SANDWICHES', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'),
('sw-chacarero', 'CHACARERO', 'Churrasco vacuno, tomate, poroto verde y mayo casera.', 5000, 1, 'SANDWICHES', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80'),

-- PAPAS FRITAS
('pf-250', 'PORCIÓN PAPAS FRITAS 250GR', 'Papas fritas crujientes doradas 250gr.', 2000, 1, 'PAPAS FRITAS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1576107246590-5750d4f18501?auto=format&fit=crop&w=600&q=80'),
('pf-salchi-ind', 'SALCHIPAPAS INDIVIDUAL', 'Papas fritas con vienesa en trozos individual.', 2500, 1, 'PAPAS FRITAS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80'),
('pf-salchi-grd', 'SALCHIPAPAS GRANDE', 'Papas fritas con abundante vienesa para compartir.', 4500, 1, 'PAPAS FRITAS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80'),

-- SOPAÍPILLAS
('sop-trad', 'SOPAÍPILLAS ($500 c/u)', 'Sopaipillas tradicionales fritas al momento.', 500, 1, 'SOPAÍPILLAS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80'),

-- COMPLETOS
('cmp-italiano', 'ITALIANO', 'Vienesa, tomate, palta y mayo casera.', 2000, 1, 'COMPLETOS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1595231712325-9fdefc6d2c18?auto=format&fit=crop&w=600&q=80'),
('cmp-aleman', 'ALEMÁN', 'Vienesa, tomate, chucrut y mayo casera.', 2000, 1, 'COMPLETOS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=600&q=80'),
('cmp-dinamico', 'DINÁMICO', 'Vienesa, tomate, chucrut, palta y mayo casera.', 2500, 1, 'COMPLETOS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1627054234594-5d9c2409f928?auto=format&fit=crop&w=600&q=80'),
('cmp-as-mechada', 'AS MECHADA', 'Carne mechada vacuno, tomate, palta y mayonesa casera.', 3000, 1, 'COMPLETOS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80'),

-- BEBESTIBLES
('beb-lata', 'BEBIDA EN LATA', 'Variedad de bebidas en lata 350ml (Coca-Cola, Fanta, Sprite).', 1500, 1, 'BEBESTIBLES', 'Sector Concepción, Chile', 'CCU / Coca-Cola', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'),
('beb-agua-sabor', 'AGUA MINERAL CON SABOR', 'Agua mineral saborizada 500ml.', 1500, 1, 'BEBESTIBLES', 'Sector Concepción, Chile', 'Vital / Cachantun', 'https://images.unsplash.com/photo-1559839914-17aae19cec71?auto=format&fit=crop&w=600&q=80'),
('beb-agua-gas', 'AGUA MINERAL (CON Y SIN GAS)', 'Agua mineral purificada 500ml.', 1500, 1, 'BEBESTIBLES', 'Sector Concepción, Chile', 'Vital / Cachantun', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80'),
('beb-score', 'SCORE', 'Bebida energética Score 500ml.', 1800, 1, 'BEBESTIBLES', 'Sector Concepción, Chile', 'Score', 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=600&q=80'),
('beb-te', 'TÉ', 'Té caliente tradicional selección.', 1000, 1, 'BEBESTIBLES', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'),
('beb-cafe', 'CAFÉ', 'Café caliente aromático.', 1000, 1, 'BEBESTIBLES', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80'),
('beb-milo', 'MILO', 'Leche caliente con Milo.', 1000, 1, 'BEBESTIBLES', 'Sector Concepción, Chile', 'Nestlé', 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80'),

-- AGREGADOS
('agr-champ', 'AGREGADO CHAMPIÑÓN', 'Porción extra de champiñones salteados.', 1000, 1, 'AGREGADOS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80'),
('agr-choclo', 'AGREGADO CHOCLO', 'Porción extra de choclo dulce.', 1000, 1, 'AGREGADOS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80'),
('agr-queso', 'AGREGADO QUESO', 'Porción extra de queso fundido.', 1000, 1, 'AGREGADOS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80'),
('agr-poroto', 'AGREGADO POROTO VERDE', 'Porción extra de poroto verde fresco.', 1000, 1, 'AGREGADOS', 'Sector Concepción, Chile', 'Tiempo', 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80');
