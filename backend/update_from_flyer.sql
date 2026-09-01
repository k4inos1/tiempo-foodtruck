-- Reset and load exact menu from flyer
DELETE FROM menu_items;

INSERT INTO menu_items (id, name, description, price, available, category, sector, brand) VALUES
-- SANDWICHES
('sw-mechada', 'SANDWICH MECHADA', 'Carne de vacuno, tomate, palta y mayo casera.', 3000, 1, 'SANDWICHES', 'Sandwiches', 'Tiempo'),
('sw-ave', 'SANDWICH AVE', 'Pollo mechada, tomate, palta y mayo casera.', 3000, 1, 'SANDWICHES', 'Sandwiches', 'Tiempo'),
('sw-churrasco', 'CHURRASCO ITALIANO', 'Churrasco vacuno, tomate, palta y mayo casera.', 4000, 1, 'SANDWICHES', 'Sandwiches', 'Tiempo'),
('sw-lomo', 'LOMO', 'Lomo de cerdo, tomate, palta y mayo casera.', 4000, 1, 'SANDWICHES', 'Sandwiches', 'Tiempo'),
('sw-luco', 'BARROS LUCO', 'Churrasco vacuno y queso derretido.', 4500, 1, 'SANDWICHES', 'Sandwiches', 'Tiempo'),
('sw-chacarero', 'CHACARERO', 'Churrasco vacuno, tomate, poroto verde y mayo casera.', 5000, 1, 'SANDWICHES', 'Sandwiches', 'Tiempo'),

-- PAPAS FRITAS
('pf-250', 'PORCIÓN PAPAS FRITAS 250GR', 'Papas fritas crujientes doradas 250gr.', 2000, 1, 'PAPAS FRITAS', 'Frituras', 'Tiempo'),
('pf-salchi-ind', 'SALCHIPAPAS INDIVIDUAL', 'Papas fritas con vienesa en trozos individual.', 2500, 1, 'PAPAS FRITAS', 'Frituras', 'Tiempo'),
('pf-salchi-grd', 'SALCHIPAPAS GRANDE', 'Papas fritas con abundante vienesa para compartir.', 4500, 1, 'PAPAS FRITAS', 'Frituras', 'Tiempo'),

-- SOPAÍPILLAS
('sop-trad', 'SOPAÍPILLAS ($500 c/u)', 'Sopaipillas tradicionales fritas al momento.', 500, 1, 'SOPAÍPILLAS', 'Tradicional', 'Tiempo'),

-- COMPLETOS
('cmp-italiano', 'ITALIANO', 'Vienesa, tomate, palta y mayo casera.', 2000, 1, 'COMPLETOS', 'Completos', 'Tiempo'),
('cmp-aleman', 'ALEMÁN', 'Vienesa, tomate, chucrut y mayo casera.', 2000, 1, 'COMPLETOS', 'Completos', 'Tiempo'),
('cmp-dinamico', 'DINÁMICO', 'Vienesa, tomate, chucrut, palta y mayo casera.', 2500, 1, 'COMPLETOS', 'Completos', 'Tiempo'),
('cmp-as-mechada', 'AS MECHADA', 'Carne mechada vacuno, tomate, palta y mayonesa casera.', 3000, 1, 'COMPLETOS', 'Completos', 'Tiempo'),

-- BEBESTIBLES
('beb-lata', 'BEBIDA EN LATA', 'Variedad de bebidas en lata 350ml (Coca-Cola, Fanta, Sprite).', 1500, 1, 'BEBESTIBLES', 'Bebestibles', 'CCU / Coca-Cola'),
('beb-agua-sabor', 'AGUA MINERAL CON SABOR', 'Agua mineral saborizada 500ml.', 1500, 1, 'BEBESTIBLES', 'Bebestibles', 'Vital / Cachantun'),
('beb-agua-gas', 'AGUA MINERAL (CON Y SIN GAS)', 'Agua mineral purificada 500ml.', 1500, 1, 'BEBESTIBLES', 'Bebestibles', 'Vital / Cachantun'),
('beb-score', 'SCORE', 'Bebida energética Score 500ml.', 1800, 1, 'BEBESTIBLES', 'Bebestibles', 'Score'),
('beb-te', 'TÉ', 'Té caliente tradicional selección.', 1000, 1, 'BEBESTIBLES', 'Calientes', 'Tiempo'),
('beb-cafe', 'CAFÉ', 'Café caliente aromático.', 1000, 1, 'BEBESTIBLES', 'Calientes', 'Tiempo'),
('beb-milo', 'MILO', 'Leche caliente con Milo.', 1000, 1, 'BEBESTIBLES', 'Calientes', 'Nestlé'),

-- AGREGADOS
('agr-champ', 'AGREGADO CHAMPIÑÓN', 'Porción extra de champiñones salteados.', 1000, 1, 'AGREGADOS', 'Extras', 'Tiempo'),
('agr-choclo', 'AGREGADO CHOCLO', 'Porción extra de choclo dulce.', 1000, 1, 'AGREGADOS', 'Extras', 'Tiempo'),
('agr-queso', 'AGREGADO QUESO', 'Porción extra de queso fundido.', 1000, 1, 'AGREGADOS', 'Extras', 'Tiempo'),
('agr-poroto', 'AGREGADO POROTO VERDE', 'Porción extra de poroto verde fresco.', 1000, 1, 'AGREGADOS', 'Extras', 'Tiempo');
