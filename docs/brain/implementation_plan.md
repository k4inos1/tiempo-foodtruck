# Nightbite (Operación Foodtruck) - Plan de Arquitectura y Ataque

La fase de reconocimiento terminó. Tenemos el mapa completo de la arquitectura. Todo será ejecutado en `C:\Users\Ricardo\Desktop\rep`, optimizado para V8 Isolates y aceleración por hardware.

## 1. Arquitectura de Base de Datos (Cloudflare D1)
Usaremos SQL en el Edge para latencia cero.

- **Tabla `menu_items`**: `id`, `name`, `description`, `price`, `available`, `image_url`.
- **Tabla `orders`**: `id`, `items_json`, `total`, `status` (PENDING, PAID, PREPARING, READY, DELIVERED), `payment_method` (CASH, WEBPAY), `created_at`.

## 2. Seguridad (Admin Panel)
- **Autenticación**: Zero-db setup. Usaremos una variable de entorno `ADMIN_SECRET` inyectada en Cloudflare Workers.
- **Flujo**: Login con contraseña -> Generación de JWT (Edge) -> Middleware en rutas `/api/admin/*`.

## 3. Real-Time Dynamics (SSE)
- **Endpoint `GET /api/stream/orders`**: Server-Sent Events (SSE). Mantendrá una conexión abierta unidireccional.
- Cuando Webpay confirme un pago o el Admin mueva una orden en el Kanban, el Worker emitirá el evento a los clientes conectados para actualizar la UI instantáneamente sin recargar la página.

## 4. Pagos (Transbank / Webpay Plus)
- **Flujo**: 
  1. Cliente crea orden -> Worker llama a API de Transbank -> Devuelve token y URL de redirección (o código para generar QR).
  2. Cliente paga -> Transbank hace un POST al webhook del Worker (`/api/webpay/webhook`).
  3. Worker verifica firma, actualiza estado en D1 a `PAID` y emite evento SSE.

## 5. Interfaz de Usuario (React + Tailwind + Motion)
- **Cliente (`/`)**: Menú interactivo oscuro. Selección de ítems, carrito flotante. Opciones de pago (Efectivo/Webpay). Animaciones de orquestación escalonada al cargar.
- **Admin (`/admin`)**: Tablero Kanban (Pendiente, Pagado, En Preparación, Listo). Las tarjetas de órdenes se actualizarán en tiempo real por SSE. Botones de acción rápida para avanzar estados.

> [!WARNING]
> **Integración Webpay:** Transbank requiere certificados y credenciales específicas. Para la primera fase de desarrollo, implementaré un "Simulador Webpay" en el frontend que dispara el webhook simulando el comportamiento exacto de Transbank. Esto nos permite terminar toda la lógica sin depender de las credenciales de producción de Transbank de inmediato. Cuando estés listo, simplemente cambiaremos las credenciales.

> [!IMPORTANT]
> **Cloudflare D1 Local:** Necesitaremos crear la base de datos local usando `npx.cmd wrangler d1 create nightbite-db` y aplicar el esquema.

## Preguntas Abiertas
¿Estás de acuerdo con usar el "Simulador Webpay" para la fase inicial de desarrollo y luego swapear a las credenciales reales de Transbank?

## Plan de Verificación
1. Desplegar migración de D1 localmente.
2. Inyectar datos de prueba en `menu_items`.
3. Levantar backend y frontend, simular una compra y verificar que el Kanban del Admin se actualiza vía SSE sin tocar nada.
