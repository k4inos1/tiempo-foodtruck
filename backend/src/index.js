const activeClients = new Set();

function broadcastSSE(type, payload) {
  const data = JSON.stringify({ type, data: payload });
  const message = `data: ${data}\n\n`;
  const encoded = new TextEncoder().encode(message);
  for (const client of activeClients) {
    try {
      client.enqueue(encoded);
    } catch (e) {
      activeClients.delete(client);
    }
  }
}

function checkAdminAuth(request, env) {
  const secret = env.ADMIN_SECRET;
  if (!secret) return false;
  
  const authHeader = request.headers.get('Authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader && cookieHeader.includes(`admin_session=${secret}`)) return true;
  
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. GET /api/menu
      if (method === 'GET' && path === '/api/menu') {
        const { results } = await env.DB.prepare('SELECT * FROM menu_items').all();
        return Response.json(results, { headers: corsHeaders });
      }

      // 2. POST /api/orders
      if (method === 'POST' && path === '/api/orders') {
        const body = await request.json();
        const id = crypto.randomUUID();
        const payment_method = body.paymentMethod || body.payment_method || 'CASH';
        const items_json = JSON.stringify(body.items || []);
        let status = 'PENDING';
        
        await env.DB.prepare(
          'INSERT INTO orders (id, items_json, total, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))'
        ).bind(id, items_json, body.total || 0, payment_method, status).run();

        const orderData = { id, items: body.items, total: body.total, payment_method, status };

        if (payment_method === 'CASH') {
          broadcastSSE('new_order', orderData);
          return Response.json({ success: true, order: orderData }, { headers: corsHeaders });
        } else if (payment_method === 'WEBPAY') {
          const payment_url = `https://mock.webpay.cl/pay?token=${id}`;
          return Response.json({ success: true, order: orderData, payment_url }, { headers: corsHeaders });
        } else {
          return Response.json({ error: 'Invalid payment method' }, { status: 400, headers: corsHeaders });
        }
      }

      // 3. POST /api/webpay/webhook
      if (method === 'POST' && path === '/api/webpay/webhook') {
        const body = await request.json();
        const { order_id } = body;
        
        await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?')
          .bind('PAID', order_id).run();
        
        broadcastSSE('order_update', { id: order_id, status: 'PAID' });
        
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // 4. GET /api/stream/orders (SSE)
      if (method === 'GET' && path === '/api/stream/orders') {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        
        activeClients.add(writer);
        
        request.signal.addEventListener('abort', () => {
          activeClients.delete(writer);
          writer.close().catch(() => {});
        });

        return new Response(readable, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          }
        });
      }

      // Admin routes
      if (path.startsWith('/api/admin')) {
        if (!checkAdminAuth(request, env)) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        // 5. GET /api/admin/orders
        if (method === 'GET' && path === '/api/admin/orders') {
          const { results } = await env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
          return Response.json(results, { headers: corsHeaders });
        }

        // 6. PUT /api/admin/orders/:id/status
        const statusMatch = path.match(/^\/api\/admin\/orders\/([^\/]+)\/status$/);
        if (method === 'PUT' && statusMatch) {
          const orderId = statusMatch[1];
          const body = await request.json();
          const newStatus = body.status;

          await env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?')
            .bind(newStatus, orderId).run();

          broadcastSSE('order_update', { id: orderId, status: newStatus });

          return Response.json({ success: true, id: orderId, status: newStatus }, { headers: corsHeaders });
        }

        // 7. POST /api/admin/menu
        if (method === 'POST' && path === '/api/admin/menu') {
          const body = await request.json();
          const id = 'm' + Date.now();
          const category = body.category || 'General';
          const sector = body.sector || 'Cocina';
          const brand = body.brand || 'Propia';
          
          await env.DB.prepare('INSERT INTO menu_items (id, name, description, price, available, category, sector, brand) VALUES (?, ?, ?, ?, 1, ?, ?, ?)')
            .bind(id, body.name, body.description || '', body.price || 0, category, sector, brand).run();
          
          return Response.json({ success: true, item: { id, name: body.name, description: body.description, price: body.price, available: 1, category, sector, brand } }, { headers: corsHeaders });
        }
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
