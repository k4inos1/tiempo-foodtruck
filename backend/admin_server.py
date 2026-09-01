"""
NightBite / Tiempo - Python Web Admin Panel Server (Port 8888)
=============================================================
Servidor administrativo nativo en Python (sin dependencias externas).
Proporciona un Dashboard Web Dark Cyberpunk / Pizarra para gestionar
el menú en tiempo real, órdenes, estado de cocina y auditoría de la base D1.
"""

import os
import sys
import json
import sqlite3
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Importar el motor de base de datos seguro
sys.path.insert(0, os.path.dirname(__file__))
from db_manager import SecureDatabaseManager, MenuItem

PORT = 8888

HTML_DASHBOARD_TEMPLATE = """<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiempo Admin Panel | Python DB Guardian</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              400: '#fbbf24',
              500: '#f59e0b',
              900: '#78350f',
              950: '#0a0a0c'
            }
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;800&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #0a0a0c; color: #f3f4f6; }
    .font-serif-vintage { font-family: 'Cinzel', serif; }
    .font-mono-code { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="min-h-screen p-4 md:p-8">
  <div class="max-w-7xl mx-auto space-y-6">
    
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#121216] border border-neutral-800 p-6 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)]">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-2xl shadow-[0_0_25px_rgba(251,191,36,0.3)]">
          T
        </div>
        <div>
          <h1 class="text-2xl md:text-3xl font-black font-serif-vintage tracking-wider text-white flex items-center gap-2">
            TIEMPO <span class="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-mono font-bold">PYTHON CORE v2.0</span>
          </h1>
          <p class="text-xs text-neutral-400 font-mono">CONCEPCIÓN, CHILE • PANEL DE CONTROL EDGE & BASE DE DATOS D1</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="refreshData()" class="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs rounded-xl border border-neutral-700 transition-all flex items-center gap-2">
          <span>🔄 Sincronizar</span>
        </button>
        <div class="px-3.5 py-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-xl flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> DB ACTIVA
        </div>
      </div>
    </header>

    <!-- KPI Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-[#121216] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between">
        <span class="text-xs font-mono text-neutral-400 uppercase">Ventas Totales</span>
        <span id="kpi-sales" class="text-3xl font-black text-amber-400 font-mono-code mt-2">$0</span>
        <span class="text-[10px] text-neutral-500 mt-1">Órdenes procesadas</span>
      </div>
      <div class="bg-[#121216] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between">
        <span class="text-xs font-mono text-neutral-400 uppercase">Total Órdenes</span>
        <span id="kpi-orders" class="text-3xl font-black text-white font-mono-code mt-2">0</span>
        <span class="text-[10px] text-neutral-500 mt-1">Registradas en SQLite</span>
      </div>
      <div class="bg-[#121216] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between">
        <span class="text-xs font-mono text-neutral-400 uppercase">Platos en Carta</span>
        <span id="kpi-items" class="text-3xl font-black text-white font-mono-code mt-2">0</span>
        <span class="text-[10px] text-neutral-500 mt-1">Sincronizados con el volante</span>
      </div>
      <div class="bg-[#121216] border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between">
        <span class="text-xs font-mono text-neutral-400 uppercase">Estado de Integridad</span>
        <span id="kpi-integrity" class="text-xl font-bold text-emerald-400 font-mono-code mt-2">VERIFICANDO</span>
        <span class="text-[10px] text-neutral-500 mt-1">PRAGMA integrity_check</span>
      </div>
    </div>

    <!-- Main Navigation Tabs -->
    <div class="flex gap-2 border-b border-neutral-800 pb-3">
      <button onclick="switchTab('menu')" id="tab-btn-menu" class="px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-400 text-neutral-950 shadow-md">
        📋 Gestión de Menú
      </button>
      <button onclick="switchTab('orders')" id="tab-btn-orders" class="px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800">
        👨‍🍳 Cocina y Órdenes
      </button>
      <button onclick="switchTab('audit')" id="tab-btn-audit" class="px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800">
        🛡️ Auditoría & Seguridad
      </button>
    </div>

    <!-- TAB: GESTIÓN DE MENÚ -->
    <section id="tab-menu" class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-white font-serif-vintage">Catálogo de Productos Oficiales</h2>
        <span class="text-xs text-neutral-400 font-mono">Edita precios y disponibilidad en 1 clic</span>
      </div>

      <div class="bg-[#121216] border border-neutral-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-neutral-300">
            <thead class="bg-neutral-950 text-neutral-400 font-mono text-xs uppercase border-b border-neutral-800">
              <tr>
                <th class="p-4">Producto</th>
                <th class="p-4">Categoría</th>
                <th class="p-4">Precio (CLP)</th>
                <th class="p-4">Disponibilidad</th>
                <th class="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="menu-table-body" class="divide-y divide-neutral-800/60 font-sans">
              <!-- Renderizado dinámico -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB: ÓRDENES -->
    <section id="tab-orders" class="space-y-4 hidden">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-white font-serif-vintage">Órdenes Transmitidas desde el Edge</h2>
      </div>
      <div class="bg-[#121216] border border-neutral-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-neutral-300">
            <thead class="bg-neutral-950 text-neutral-400 font-mono text-xs uppercase border-b border-neutral-800">
              <tr>
                <th class="p-4">ID Orden</th>
                <th class="p-4">Fecha / Hora</th>
                <th class="p-4">Detalle Items</th>
                <th class="p-4">Total</th>
                <th class="p-4">Método</th>
                <th class="p-4">Estado</th>
                <th class="p-4 text-right">Actualizar Estado</th>
              </tr>
            </thead>
            <tbody id="orders-table-body" class="divide-y divide-neutral-800/60 font-sans">
              <!-- Renderizado dinámico -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- TAB: AUDITORÍA -->
    <section id="tab-audit" class="space-y-4 hidden">
      <div class="bg-[#121216] border border-neutral-800 p-6 rounded-2xl space-y-4 font-mono-code text-xs">
        <h2 class="text-base font-bold text-amber-400">AUDITORÍA CRIPTOGRÁFICA Y DE INTEGRIDAD</h2>
        <pre id="audit-log" class="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-neutral-300 overflow-x-auto">
Cargando telemetría...
        </pre>
      </div>
    </section>

  </div>

  <script>
    async function fetchJSON(url, opts = {}) {
      const res = await fetch(url, opts);
      return res.json();
    }

    function switchTab(tab) {
      ['menu', 'orders', 'audit'].forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
        document.getElementById(`tab-btn-${t}`).className = 'px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800';
      });
      document.getElementById(`tab-${tab}`).classList.remove('hidden');
      document.getElementById(`tab-btn-${tab}`).className = 'px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-400 text-neutral-950 shadow-md';
    }

    async function toggleAvailability(id) {
      await fetchJSON('/api/py/menu/toggle', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id })
      });
      refreshData();
    }

    async function editPrice(id, currentPrice) {
      const p = prompt(`Nuevo precio para ${id}:`, currentPrice);
      if (p !== null && !isNaN(p) && parseInt(p) >= 0) {
        await fetchJSON('/api/py/menu/price', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ id, price: parseInt(p) })
        });
        refreshData();
      }
    }

    async function updateOrderStatus(id, newStatus) {
      await fetchJSON('/api/py/orders/status', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id, status: newStatus })
      });
      refreshData();
    }

    async function refreshData() {
      try {
        const [menu, orders, audit] = await Promise.all([
          fetchJSON('/api/py/menu'),
          fetchJSON('/api/py/orders'),
          fetchJSON('/api/py/audit')
        ]);

        // KPIs
        document.getElementById('kpi-sales').innerText = `$${audit.total_sales_clp.toLocaleString('es-CL')}`;
        document.getElementById('kpi-orders').innerText = audit.total_orders;
        document.getElementById('kpi-items').innerText = audit.total_menu_items;
        document.getElementById('kpi-integrity').innerText = `OK (${audit.sqlite_integrity.toUpperCase()})`;
        document.getElementById('audit-log').innerText = JSON.stringify(audit, null, 2);

        // Render Menu
        const menuBody = document.getElementById('menu-table-body');
        menuBody.innerHTML = menu.map(item => `
          <tr class="hover:bg-neutral-900/50 transition-colors">
            <td class="p-4">
              <div class="flex items-center gap-3">
                ${item.image_url ? `<img src="${item.image_url}" class="w-12 h-12 object-cover rounded-xl border border-neutral-700 shrink-0" />` : ''}
                <div>
                  <div class="font-bold text-white uppercase">${item.name}</div>
                  <div class="text-xs text-neutral-500">${item.description}</div>
                </div>
              </div>
            </td>
            <td class="p-4">
              <span class="px-2.5 py-1 bg-neutral-800 text-amber-400 text-xs font-mono rounded-lg border border-neutral-700">${item.category}</span>
            </td>
            <td class="p-4 font-mono-code font-bold text-amber-400 text-base">
              $${item.price.toLocaleString('es-CL')}
            </td>
            <td class="p-4">
              <button onclick="toggleAvailability('${item.id}')" class="px-3 py-1 text-xs font-bold font-mono rounded-full border transition-all ${
                item.available === 1 
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900' 
                  : 'bg-red-950/60 text-red-400 border-red-500/40 hover:bg-red-900'
              }">
                ${item.available === 1 ? '● DISPONIBLE' : '○ AGOTADO'}
              </button>
            </td>
            <td class="p-4 text-right">
              <button onclick="editPrice('${item.id}', ${item.price})" class="px-3 py-1.5 bg-neutral-800 hover:bg-amber-400 hover:text-neutral-950 font-mono font-bold text-xs rounded-lg transition-colors">
                ✏️ Precio
              </button>
            </td>
          </tr>
        `).join('');

        // Render Orders
        const ordersBody = document.getElementById('orders-table-body');
        ordersBody.innerHTML = orders.map(o => {
          const itemsStr = o.items.map(i => `${i.name} (x${i.quantity})`).join(', ');
          const statusColors = {
            PENDING: 'bg-yellow-950/60 text-yellow-400 border-yellow-500/40',
            PREPARING: 'bg-purple-950/60 text-purple-400 border-purple-500/40',
            READY: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
            PAID: 'bg-blue-950/60 text-blue-400 border-blue-500/40',
            CANCELLED: 'bg-red-950/60 text-red-400 border-red-500/40'
          }[o.status] || 'bg-neutral-800 text-neutral-300';

          return `
            <tr class="hover:bg-neutral-900/50 transition-colors">
              <td class="p-4 font-mono-code text-xs text-neutral-400">${o.id}</td>
              <td class="p-4 text-xs font-mono text-neutral-400">${o.created_at ? o.created_at.substring(0, 19) : '-'}</td>
              <td class="p-4 text-xs text-white max-w-xs font-medium">${itemsStr || 'Sin detalle'}</td>
              <td class="p-4 font-mono-code font-bold text-amber-400">$${o.total.toLocaleString('es-CL')}</td>
              <td class="p-4 text-xs font-mono">${o.payment_method}</td>
              <td class="p-4">
                <span class="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${statusColors}">
                  ${o.status}
                </span>
              </td>
              <td class="p-4 text-right">
                <select onchange="updateOrderStatus('${o.id}', this.value)" class="bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 rounded-lg p-1.5 font-mono">
                  <option value="" disabled selected>Cambiar...</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PREPARING">PREPARING</option>
                  <option value="READY">READY</option>
                  <option value="PAID">PAID</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </td>
            </tr>
          `;
        }).join('');

      } catch (e) {
        console.error("Error sincronizando dashboard:", e);
      }
    }

    refreshData();
    // Auto-polling cada 5 segundos
    setInterval(refreshData, 5000);
  </script>
</body>
</html>
"""

class AdminRequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

    def _send_html(self, html_str, status=200):
        body = html_str.encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        mgr = SecureDatabaseManager()

        if url.path == '/' or url.path == '/admin':
            self._send_html(HTML_DASHBOARD_TEMPLATE)
        elif url.path == '/api/py/menu':
            items = [item.__dict__ for item in mgr.get_all_menu_items()]
            self._send_json(items)
        elif url.path == '/api/py/orders':
            orders = [
                {
                    "id": o.id,
                    "items": o.items,
                    "total": o.total,
                    "status": o.status,
                    "payment_method": o.payment_method,
                    "created_at": o.created_at
                }
                for o in mgr.get_recent_orders()
            ]
            self._send_json(orders)
        elif url.path == '/api/py/audit':
            self._send_json(mgr.run_integrity_audit())
        else:
            self.send_error(404, "Ruta no encontrada en Python Admin Server")

    def do_POST(self):
        url = urlparse(self.path)
        mgr = SecureDatabaseManager()
        length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(length)
        payload = json.loads(post_data.decode('utf-8')) if post_data else {}

        if url.path == '/api/py/menu/toggle':
            item_id = payload.get('id')
            new_state = mgr.toggle_item_availability(item_id)
            self._send_json({"success": True, "new_state": new_state})
        elif url.path == '/api/py/menu/price':
            item_id = payload.get('id')
            new_price = payload.get('price')
            success = mgr.update_item_price(item_id, new_price)
            self._send_json({"success": success})
        elif url.path == '/api/py/orders/status':
            order_id = payload.get('id')
            new_status = payload.get('status')
            success = mgr.update_order_status(order_id, new_status)
            self._send_json({"success": success})
        else:
            self.send_error(404, "Endpoint de mutación no encontrado")

def run_server():
    server = HTTPServer(('127.0.0.1', PORT), AdminRequestHandler)
    print(f"\n===========================================================")
    print(f"[*] PYTHON ADMIN WEB DASHBOARD ACTIVO: http://127.0.0.1:{PORT}")
    print(f"[*] Monitoreo en tiempo real de Base de Datos Cloudflare D1")
    print(f"===========================================================\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Apagando servidor Python Admin...")
        server.server_close()

if __name__ == '__main__':
    run_server()
