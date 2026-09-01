DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS orders;

CREATE TABLE menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    available INTEGER DEFAULT 1,
    image_url TEXT
);

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    items_json TEXT NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL, -- PENDING, PAID, PREPARING, READY, DELIVERED
    payment_method TEXT NOT NULL, -- CASH, WEBPAY
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO menu_items (id, name, description, price, available) VALUES
('m1', 'Burger Onyx', 'Doble carne, queso cheddar oscuro, salsa secreta.', 8500, 1),
('m2', 'Papas Cyberpunk', 'Papas rústicas con aceite de trufa y parmesano.', 4500, 1),
('m3', 'Bebida Glitch', 'Energética con sabor a frutos del bosque.', 2500, 1);
