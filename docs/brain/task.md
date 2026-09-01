# Operación Foodtruck - Tareas

- [/] Inicializar esquema de Base de Datos (Cloudflare D1)
  - [ ] Crear archivo schema.sql
  - [ ] Aplicar migración en D1 local
  - [ ] Insertar datos semilla (Menú de prueba)
- [x] Construir Backend (Edge-First)
  - [ ] Configurar binding de D1 en wrangler.toml
  - [ ] Implementar autenticación JWT para Admin
  - [ ] Implementar rutas de Menú (GET)
  - [ ] Implementar rutas de Órdenes (POST, PUT estados)
  - [ ] Implementar SSE (Server-Sent Events) en `/api/stream/orders`
  - [ ] Implementar Webhook Mock de Transbank
- [x] Construir Frontend (Motion UI)
  - [ ] Configurar enrutamiento (Cliente vs Admin)
  - [ ] Interfaz de Cliente: Lista de menú, carrito, simulación de pago.
  - [ ] Interfaz de Admin: Login, Tablero Kanban de órdenes.
  - [ ] Conectar Admin UI con SSE para actualizaciones en tiempo real.
- [ ] Verificación
  - [ ] Levantar servicios localmente y probar flujo End-to-End.
