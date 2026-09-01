import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, QrCode, BarChart3, LogOut, PlusCircle, FileText, ShoppingCart, Minus, Plus, Trash2, Banknote, CreditCard, Calculator } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Scanner } from '@yudiel/react-qr-scanner';

const STATUSES = [
  { id: 'PENDING', label: 'Pendiente', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle },
  { id: 'PAID', label: 'Pagado', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', icon: Banknote },
  { id: 'PREPARING', label: 'En Preparación', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', icon: PlusCircle },
  { id: 'READY', label: 'Listo', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: Check }
];

function Check(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>;
}

export default function AdminView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [activeTab, setActiveTab] = useState('pos'); 
  const [error, setError] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: 'General', sector: 'Cocina', brand: 'Propia' });
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [posCart, setPosCart] = useState([]);
  const [posCategory, setPosCategory] = useState('Todos');

  const authenticate = () => {
    fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${password}` } })
    .then(res => {
      if(res.ok) {
        setIsAuthenticated(true);
        loadData();
      } else {
        alert('Contraseña incorrecta');
      }
    })
    .catch(() => alert('Error de conexión'));
  };

  const loadData = () => {
    fetch('/api/admin/orders', { headers: { 'Authorization': `Bearer ${password}` } })
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data.map(o => ({ ...o, items: o.items || JSON.parse(o.items_json || '[]') })) : []))
      .catch(err => console.error(err));

    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenu(data));

    const eventSource = new EventSource('/api/stream/orders');
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'init') {
          setOrders(parsed.data.orders);
        } else if (parsed.type === 'new_order') {
          setOrders(prev => [parsed.data, ...prev]);
        } else if (parsed.type === 'order_update') {
          setOrders(prev => prev.map(o => o.id === parsed.data.id ? { ...o, status: parsed.data.status } : o));
        }
      } catch (e) {}
    };
    eventSource.onerror = () => setError('Conexión perdida. Reconectando...');
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: updated.status } : o));
      }
    } catch (err) {}
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsAddingProduct(true);
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${password}` },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          price: parseInt(newProduct.price),
          category: newProduct.category,
          sector: newProduct.sector,
          brand: newProduct.brand
        })
      });
      if (res.ok) {
        const result = await res.json();
        setMenu(prev => [...prev, result.item]);
        setNewProduct({ name: '', description: '', price: '', category: 'General', sector: 'Cocina', brand: 'Propia' });
      }
    } catch (err) {
      console.error(err);
      alert('Error agregando el producto');
    }
    setIsAddingProduct(false);
  };

  const handleQRDetection = (result) => {
    if (result) {
      const orderId = result[0].rawValue;
      if (confirm(`¿Marcar orden #${orderId.slice(0,6)} como LISTA?`)) {
        updateStatus(orderId, 'READY');
      }
      setIsQRModalOpen(false);
    }
  };

  const addToPosCart = (item) => {
    setPosCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updatePosQuantity = (id, delta) => {
    setPosCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromPosCart = (id) => {
    setPosCart(prev => prev.filter(i => i.id !== id));
  };

  const submitPosOrder = async (method) => {
    if (posCart.length === 0) return;
    const total = posCart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: posCart, total, paymentMethod: method })
      });
      if (res.ok) {
        setPosCart([]);
      } else {
        alert('Error procesando orden POS');
      }
    } catch (err) {
      alert('Error de conexión');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-orange-100 text-center"
        >
          <Lock className="mx-auto text-orange-500 mb-4" size={48} />
          <h2 className="text-2xl font-black text-neutral-800 mb-2">Acceso Restringido</h2>
          <p className="text-neutral-500 mb-6">Ingresa la clave única del administrador</p>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && authenticate()}
            className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none text-center font-bold text-lg mb-4"
            placeholder="••••••••"
          />
          <button 
            onClick={authenticate}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
          >
            Entrar al Sistema
          </button>
        </motion.div>
      </div>
    );
  }

  const getOrdersByStatus = (statusId) => orders.filter(o => o.status === statusId);
  const totalRevenue = orders.filter(o => o.status === 'PAID' || o.status === 'READY').reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-6 h-screen flex flex-col bg-slate-50 overflow-hidden relative">
      <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end shrink-0 gap-4 relative z-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Centro de Comando - Tiempo
            {error && <span className="text-sm font-medium text-red-500 bg-red-100 px-3 py-1 rounded-full flex items-center gap-1"><AlertCircle size={14}/> {error}</span>}
          </h1>
        </div>
        <div className="flex gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setIsQRModalOpen(true)}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors"
          >
            <QrCode size={18} /> Escanear Orden
          </button>
          <button 
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${activeTab === 'pos' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Calculator size={18} /> Caja POS
          </button>
          <button 
            onClick={() => setActiveTab('kanban')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${activeTab === 'kanban' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Cocina
          </button>
          <button 
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${activeTab === 'metrics' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <BarChart3 size={18} /> Menú & Data
          </button>
          <button onClick={() => setIsAuthenticated(false)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {activeTab === 'pos' && (
        <div className="flex-grow flex gap-6 min-h-0 overflow-hidden relative z-10">
          {/* Grilla de Menú */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 custom-scrollbar">
              {['Todos', ...new Set(menu.map(i => i.category))].map(cat => (
                <button key={cat} onClick={() => setPosCategory(cat)} className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${posCategory === cat ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{cat}</button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto custom-scrollbar p-1">
              {menu.filter(i => posCategory === 'Todos' || i.category === posCategory).map(item => (
                <button key={item.id} onClick={() => addToPosCart(item)} className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-left hover:bg-orange-50 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between h-28 group">
                  <span className="font-bold text-slate-800 leading-tight group-hover:text-orange-600 transition-colors">{item.name}</span>
                  <span className="text-orange-600 font-black">${item.price}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Ticket / Cart */}
          <div className="w-96 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col shrink-0">
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><ShoppingCart size={20}/> Ticket Actual</h2>
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-3 mb-4">
              {posCart.length === 0 ? (
                <div className="text-center text-slate-400 font-medium mt-10">El ticket está vacío</div>
              ) : posCart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                    <div className="text-orange-600 font-black text-sm">${item.price * item.quantity}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updatePosQuantity(item.id, -1)} className="p-1 bg-white border border-slate-200 shadow-sm rounded text-slate-600 hover:bg-slate-100"><Minus size={14}/></button>
                    <span className="font-bold w-6 text-center text-slate-700">{item.quantity}</span>
                    <button onClick={() => updatePosQuantity(item.id, 1)} className="p-1 bg-white border border-slate-200 shadow-sm rounded text-slate-600 hover:bg-slate-100"><Plus size={14}/></button>
                    <button onClick={() => removeFromPosCart(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded ml-1 transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t-2 border-slate-100">
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="font-bold text-slate-500">TOTAL</span>
                <span className="text-3xl font-black text-slate-800">${posCart.reduce((s, i) => s + (i.price * i.quantity), 0)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button disabled={posCart.length === 0} onClick={() => submitPosOrder('CASH')} className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95">
                  <Banknote size={20}/> Efectivo
                </button>
                <button disabled={posCart.length === 0} onClick={() => submitPosOrder('WEBPAY')} className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95">
                  <CreditCard size={20}/> Tarjeta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-0 overflow-x-auto pb-4 relative z-10">
          {STATUSES.map(column => (
            <div key={column.id} className={`bg-white rounded-2xl flex flex-col shadow-sm border-2 ${column.border} overflow-hidden`}>
              <div className={`p-4 border-b ${column.border} flex items-center justify-between ${column.bg}`}>
                <div className="flex items-center gap-2">
                  <column.icon size={20} className={column.color} />
                  <h2 className={`font-black ${column.color}`}>{column.label}</h2>
                </div>
                <span className="bg-white text-slate-700 text-xs px-2 py-1 rounded-md font-bold shadow-sm">
                  {getOrdersByStatus(column.id).length}
                </span>
              </div>

              <div className="p-4 flex-grow overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/50">
                <AnimatePresence>
                  {getOrdersByStatus(column.id).map(order => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={order.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold text-slate-400">#{order.id.slice(0, 5).toUpperCase()}</span>
                          <div className="font-bold text-slate-700 mt-1">
                            {order.payment_method === 'WEBPAY' ? (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded mr-2">WEB</span>
                            ) : (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded mr-2">EFECTIVO</span>
                            )}
                          </div>
                        </div>
                        <div className="text-orange-600 font-black">${order.total}</div>
                      </div>
                      
                      <ul className="text-sm text-slate-600 font-medium space-y-1 mb-4">
                        {order.items?.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center bg-slate-50 px-2 py-1 rounded">
                            <span><span className="font-bold text-orange-500">{item.quantity}x</span> {item.name}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {STATUSES.map((s) => {
                          if (s.id === column.id) return null;
                          return (
                            <button
                              key={s.id}
                              onClick={() => updateStatus(order.id, s.id)}
                              className="flex-1 min-w-[30%] py-1.5 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors uppercase"
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="flex-grow flex gap-6 min-h-0 overflow-hidden relative z-10">
          <div className="w-1/3 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><BarChart3/> Rendimiento</h2>
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                  <p className="text-emerald-600 font-bold text-sm">Ventas Confirmadas</p>
                  <p className="text-3xl font-black text-emerald-700">${totalRevenue}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                  <p className="text-blue-600 font-bold text-sm">Total Órdenes</p>
                  <p className="text-3xl font-black text-blue-700">{orders.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><PlusCircle/> Nuevo Producto</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                    <input required value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" placeholder="Ej: Fanta" />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precio</label>
                    <input required type="number" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" placeholder="1500" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoría</label>
                    <input required value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" placeholder="Bebidas Frías" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marca</label>
                    <input required value={newProduct.brand} onChange={e=>setNewProduct({...newProduct, brand: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500" placeholder="Ej: Coca-Cola" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sector (Cocina/Barra)</label>
                    <select value={newProduct.sector} onChange={e=>setNewProduct({...newProduct, sector: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 bg-white">
                      <option>Cocina</option>
                      <option>Barra</option>
                      <option>Refrigerador</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                  <textarea value={newProduct.description} onChange={e=>setNewProduct({...newProduct, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 text-sm" placeholder="Refrescante..."></textarea>
                </div>
                <button disabled={isAddingProduct} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors">
                  {isAddingProduct ? 'Guardando...' : 'Agregar al Menú'}
                </button>
              </form>
            </div>
          </div>

          <div className="flex-grow bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><FileText/> Gestión de Menú (Legal/Marcas)</h2>
              <button 
                onClick={generatePDFMenu}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-colors flex items-center gap-2"
              >
                Exportar Menú PDF
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                  <tr className="text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-3 font-bold">Categoría</th>
                    <th className="p-3 font-bold">Marca</th>
                    <th className="p-3 font-bold">Item</th>
                    <th className="p-3 font-bold">Precio</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium text-slate-700">
                  {menu.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-slate-500"><span className="bg-slate-100 px-2 py-1 rounded">{item.category}</span></td>
                      <td className="p-3 text-slate-500"><span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs font-black">{item.brand}</span></td>
                      <td className="p-3 font-bold text-slate-900">{item.name}</td>
                      <td className="p-3 text-orange-600 font-black">${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* QR SCANNER MODAL */}
      <AnimatePresence>
        {isQRModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setIsQRModalOpen(false)}
                className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2"><QrCode/> Lector de Órdenes</h2>
              <p className="text-slate-500 text-sm mb-6">Apunta el código QR de la boleta para gestionar el estado automáticamente.</p>
              
              <div className="rounded-2xl overflow-hidden border-4 border-slate-100 aspect-square">
                <Scanner onScan={handleQRDetection} onError={(e) => console.log('Scanner err', e)} />
              </div>
              <p className="text-center text-xs text-slate-400 mt-4">Esperando código...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
