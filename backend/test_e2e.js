const API_URL = 'http://localhost:8787/api';
const ADMIN_SECRET = 'tiempo2026';

async function runTests() {
  console.log('[*] INICIANDO PROTOCOLO DE TEST E2E Y AUDITORIA...');
  
  try {
    // 1. Fetch Menu
    console.log('\n[1] TEST: GET /api/menu');
    const menuRes = await fetch(`${API_URL}/menu`);
    const menu = await menuRes.json();
    if (!Array.isArray(menu) || menu.length === 0) throw new Error("Menú vacío o formato incorrecto");
    console.log(`  [✓] Menú cargado correctamente: ${menu.length} productos detectados (Incluyendo marcas).`);

    // 2. Place Order
    console.log('\n[2] TEST: POST /api/orders (Creación de Orden)');
    const orderRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'm1', name: 'Completo', quantity: 2 }], total: 5000, paymentMethod: 'CASH' })
    });
    const orderData = await orderRes.json();
    if (!orderData.success || !orderData.order.id) throw new Error("Fallo al crear la orden");
    console.log(`  [✓] Orden inyectada exitosamente. ID: ${orderData.order.id} | Total: $${orderData.order.total}`);

    // 3. Check Admin Auth Without Password (Expected to Fail)
    console.log('\n[3] TEST: GET /api/admin/orders (Prueba de Intrusión sin Auth)');
    const failRes = await fetch(`${API_URL}/admin/orders`);
    if (failRes.ok) throw new Error("Brecha de seguridad: Se accedió al admin sin token.");
    console.log(`  [✓] Seguridad activa. Acceso denegado correctamente (HTTP ${failRes.status}).`);

    // 4. Check Admin Auth With Password
    console.log('\n[4] TEST: GET /api/admin/orders (Auth Válida)');
    const adminRes = await fetch(`${API_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${ADMIN_SECRET}` }
    });
    const adminOrders = await adminRes.json();
    if (!Array.isArray(adminOrders)) throw new Error("Fallo en la lectura de órdenes de admin");
    console.log(`  [✓] Autorización verificada. Órdenes totales en BD: ${adminOrders.length}`);

    // 5. Update Order Status
    console.log('\n[5] TEST: PUT /api/admin/orders/:id/status (Actualización Kanban)');
    const updateRes = await fetch(`${API_URL}/admin/orders/${orderData.order.id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_SECRET}`
      },
      body: JSON.stringify({ status: 'READY' })
    });
    const updateData = await updateRes.json();
    if (updateData.status !== 'READY') throw new Error("Fallo al actualizar el estado");
    console.log(`  [✓] Estado de orden actualizado remotamente a: ${updateData.status}`);

    console.log('\n======================================================');
    console.log('[★] SISTEMA BLINDADO. TODOS LOS TESTS HAN SIDO SUPERADOS.');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n[X] FALLO CRÍTICO EN LA PRUEBA:', error.message);
  }
}

runTests();
