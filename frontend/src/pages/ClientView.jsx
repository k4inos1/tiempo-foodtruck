import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Plus, Minus, CreditCard, Banknote, ShieldCheck, 
  Download, Clock, Flame, UtensilsCrossed, Sparkles, Check, ChevronRight,
  Coffee, Wine, Zap, Layers, AlertCircle
} from 'lucide-react';

// Variantes de animación con curvas Bezier avanzadas
const containerMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const itemMotion = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

// Componente: Cinta de Título Vintage / Chalkboard Ribbon
function CategoryRibbon({ title, icon: Icon }) {
  return (
    <div className="relative my-8 flex items-center justify-center select-none">
      <div className="relative z-10 inline-flex items-center gap-3 px-8 py-2.5 bg-neutral-950 border-2 border-amber-400 text-amber-400 font-black tracking-widest uppercase text-xl md:text-2xl shadow-[0_0_15px_rgba(251,191,36,0.25)] rounded-sm">
        {Icon && <Icon size={22} className="text-amber-400 animate-pulse" />}
        <span>{title}</span>
      </div>
      {/* Líneas decorativas doradas estilo volante */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-amber-400/40"></div>
      </div>
    </div>
  );
}

// Helper de imágenes representativas para el menú
const getFoodImage = (id, category) => {
  if (id.includes('mechada') || id.includes('sw-')) {
    return 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80';
  }
  if (id.includes('pf-') || category === 'PAPAS FRITAS') {
    return 'https://images.unsplash.com/photo-1576107246590-5750d4f18501?auto=format&fit=crop&w=500&q=80';
  }
  if (id.includes('cmp-') || category === 'COMPLETOS') {
    return 'https://images.unsplash.com/photo-1595231712325-9fdefc6d2c18?auto=format&fit=crop&w=500&q=80';
  }
  if (id.includes('sop-') || category === 'SOPAÍPILLAS') {
    return 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80';
  }
  if (id.includes('beb-') || category === 'BEBESTIBLES') {
    return 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80';
  }
  return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=500&q=80';
};

export default function ClientView() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [notification, setNotification] = useState(null);

  // Horario de atención: Cierre a las 18:00 hrs
  const [timeLeft, setTimeLeft] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const closingTime = new Date();
      closingTime.setHours(18, 0, 0, 0);

      const diff = closingTime - now;

      if (diff > 0) {
        setIsOpen(true);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setIsOpen(false);
        setTimeLeft('00:00:00');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setMenu(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al sincronizar menú:', err);
        setLoading(false);
      });
  }, []);

  const showToast = (name, isError = false) => {
    setNotification({ text: name, isError });
    setTimeout(() => setNotification(null), 2500);
  };

  const addToCart = (item) => {
    if (!isOpen) {
      showToast('Cocina cerrada por hoy (Horario hasta las 18:00)', true);
      return;
    }
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`Añadido: ${item.name}`);
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity === 1) {
        return prev.filter(i => i.id !== id);
      }
      return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (method) => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Security-Client': 'Onyx-Secure-V2'
        },
        body: JSON.stringify({ items: cart, total, paymentMethod: method })
      });
      if (res.ok) {
        setCart([]);
        setIsCartOpen(false);
        alert('¡Orden transmitida en tiempo real a la cocina de Tiempo!');
      } else {
        alert('Error al despachar orden.');
      }
    } catch (err) {
      alert('Error en conexión con el Worker.');
    }
    setCheckingOut(false);
  };

  // Categorías fijas en el orden del volante físico
  const CATEGORY_SECTIONS = [
    { key: 'SANDWICHES', title: 'SANDWICHES', icon: UtensilsCrossed },
    { key: 'PAPAS FRITAS', title: 'PAPAS FRITAS', icon: Flame },
    { key: 'SOPAÍPILLAS', title: 'SOPAÍPILLAS', icon: Sparkles },
    { key: 'COMPLETOS', title: 'COMPLETOS', icon: Zap },
    { key: 'BEBESTIBLES', title: 'BEBESTIBLES', icon: Coffee },
    { key: 'AGREGADOS', title: 'AGREGADOS (Extras $1.000)', icon: Layers }
  ];

  const filteredCategories = activeCategory === 'TODOS' 
    ? CATEGORY_SECTIONS 
    : CATEGORY_SECTIONS.filter(c => c.key === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 font-sans selection:bg-amber-400 selection:text-neutral-950 relative overflow-x-hidden">
      
      {/* Fondo Chalkboard con textura sutil */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Toast Notification Micro-interaction */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] font-black px-6 py-3 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center gap-2 text-sm border-2 border-white ${
              notification.isError 
                ? 'bg-red-500 text-white shadow-red-500/50' 
                : 'bg-amber-400 text-neutral-950'
            }`}
          >
            {notification.isError ? <AlertCircle size={18} strokeWidth={3} /> : <Check size={18} strokeWidth={3} />}
            {notification.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Logo Emblemático estilo Volante */}
      <header className="relative z-10 pt-10 pb-6 px-4 max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Top Navbar Actions */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 mb-8 border-b border-neutral-800 pb-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono font-bold tracking-widest uppercase">
            {isOpen ? (
              <span className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                COCINA ABIERTA • CIERRA EN: <span className="text-white font-mono">{timeLeft}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-red-950/60 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                COCINA CERRADA • HORARIO HASTA LAS 18:00
              </span>
            )}
            <span className="text-neutral-600 hidden sm:inline">|</span>
            <span className="text-neutral-300 flex items-center gap-1">
              📍 SECTOR CONCEPCIÓN, CHILE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="/Carta_Tiempo.pdf" 
              download
              className="flex items-center gap-2 text-xs font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-full text-neutral-300 hover:text-amber-400 transition-all shadow-sm"
            >
              <Download size={14} /> Descargar Carta PDF
            </a>
          </div>
        </div>

        {/* Emblema Circular Oficial TIEMPO */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative group mb-4"
        >
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-amber-400 bg-neutral-950 p-2 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.35)] relative overflow-hidden">
            {/* Esfera de reloj vintage */}
            <div className="absolute inset-0 opacity-20 border-[8px] border-dashed border-amber-400 rounded-full animate-[spin_60s_linear_infinite]" />
            <Clock size={36} className="text-amber-400 mb-1" strokeWidth={2.5} />
            <span className="font-black text-2xl md:text-3xl tracking-tighter text-amber-400 uppercase leading-none font-serif">
              TIEMPO
            </span>
            <span className="text-[10px] md:text-xs text-neutral-300 italic font-medium tracking-tight mt-1">
              para un antojo perfecto
            </span>
          </div>
        </motion.div>

        {/* Título Principal */}
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl md:text-6xl font-black tracking-wider uppercase text-white font-serif drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
        >
          NUESTRO MENÚ
        </motion.h1>
        <p className="text-neutral-400 text-sm md:text-base max-w-lg mt-2 font-medium">
          Selección artesanal preparada al momento en Concepción, Chile. Ingredientes frescos, porciones generosas y sabor tradicional.
        </p>

        {/* Selector de Categorías (Pills) */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-4xl">
          <button
            onClick={() => setActiveCategory('TODOS')}
            className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 ${
              activeCategory === 'TODOS'
                ? 'bg-amber-400 text-neutral-950 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-105'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-amber-400/50 hover:text-white'
            }`}
          >
            ★ TODOS LOS PLATOS
          </button>
          {CATEGORY_SECTIONS.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 ${
                activeCategory === cat.key
                  ? 'bg-amber-400 text-neutral-950 shadow-[0_0_20px_rgba(251,191,36,0.4)] scale-105'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:border-amber-400/50 hover:text-white'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </header>

      {/* Grid del Menú por Categorías */}
      <main className="max-w-6xl mx-auto px-4 pb-32 relative z-10">
        {loading ? (
          <div className="text-center py-24">
            <Clock className="animate-spin text-amber-400 mx-auto mb-4" size={48} />
            <p className="font-mono text-neutral-400 uppercase tracking-widest">Sincronizando con la carta oficial...</p>
          </div>
        ) : (
          filteredCategories.map(cat => {
            const itemsInCategory = menu.filter(item => item.category === cat.key);
            if (itemsInCategory.length === 0) return null;

            return (
              <section key={cat.key} className="mb-14">
                <CategoryRibbon title={cat.title} icon={cat.icon} />

                <motion.div 
                  variants={containerMotion}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {itemsInCategory.map(item => (
                    <motion.div
                      key={item.id}
                      variants={itemMotion}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="bg-[#121215] border border-neutral-800/80 rounded-2xl overflow-hidden hover:border-amber-400/60 hover:shadow-[0_4px_30px_rgba(251,191,36,0.15)] transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      {/* Imagen Stock en Alta Calidad */}
                      {item.image_url && (
                        <div className="w-full h-44 bg-neutral-900 relative overflow-hidden">
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            loading="lazy" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#121215] via-transparent to-black/30" />
                          {item.brand && item.brand !== 'Tiempo' && (
                            <span className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-neutral-950/80 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-md border border-neutral-700/80 shadow-sm uppercase">
                              {item.brand}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Contenido de la Tarjeta */}
                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <div>
                          {/* Título */}
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="text-lg md:text-xl font-black text-neutral-100 uppercase tracking-wide group-hover:text-amber-400 transition-colors font-serif leading-tight">
                              {item.name}
                            </h3>
                          </div>

                          {/* Descripción / Ingredientes */}
                          <p className="text-neutral-400 text-xs md:text-sm font-sans leading-relaxed mb-6">
                            {item.description}
                          </p>
                        </div>

                        {/* Pie de tarjeta: Precio y Botón Agregar */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-800/60 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Precio</span>
                            <span className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-tight">
                              ${item.price.toLocaleString('es-CL')}
                            </span>
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(item)}
                            className="w-11 h-11 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 flex items-center justify-center font-black shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all group-hover:scale-105"
                            title="Añadir a la orden"
                          >
                            <Plus size={22} strokeWidth={3} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            );
          })
        )}
      </main>

      {/* Floating Action Button (Carrito Flotante) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-amber-400 text-neutral-950 p-4 md:p-5 rounded-2xl shadow-[0_10px_35px_rgba(251,191,36,0.45)] border-2 border-white flex items-center gap-3 font-black"
      >
        <ShoppingCart size={26} strokeWidth={2.5} />
        {cart.length > 0 && (
          <span className="bg-neutral-950 text-amber-400 text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-amber-400">
            {cart.reduce((s, i) => s + i.quantity, 0)} | ${total.toLocaleString('es-CL')}
          </span>
        )}
      </motion.button>

      {/* Drawer del Carrito / Checkout Seguro */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[80]"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#111114] border-l-2 border-amber-400/40 z-[90] flex flex-col shadow-2xl"
            >
              {/* Encabezado del Carrito */}
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/30">
                    <ShoppingCart size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase font-serif">Tu Pedido</h2>
                    <p className="text-xs text-neutral-400">Listo para enviar a preparación</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  <Minus size={20} />
                </button>
              </div>

              {/* Lista de Items */}
              <div className="flex-grow overflow-y-auto p-6 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <UtensilsCrossed size={48} className="text-neutral-700 mb-4 animate-bounce" />
                    <p className="font-bold text-neutral-300 text-lg">Tu canasta está vacía</p>
                    <p className="text-xs text-neutral-500 max-w-xs mt-1">Selecciona cualquier plato de la carta para comenzar tu orden.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <motion.div
                      layout
                      key={item.id}
                      className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 flex justify-between items-center"
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="font-bold text-sm text-neutral-100 uppercase">{item.name}</h4>
                        <span className="text-amber-400 font-mono font-bold text-sm">
                          ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-1 rounded-lg">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-sm text-amber-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Checkout y Total */}
              {cart.length > 0 && (
                <div className="p-6 bg-neutral-950 border-t border-neutral-800 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-400 font-mono text-sm uppercase">Total Orden</span>
                    <span className="text-3xl font-black text-amber-400 font-mono">
                      ${total.toLocaleString('es-CL')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={checkingOut}
                      onClick={() => handleCheckout('CASH')}
                      className="flex items-center justify-center gap-2 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold text-sm transition-all border border-neutral-700"
                    >
                      <Banknote size={18} /> Pago Efectivo
                    </button>
                    <button
                      disabled={checkingOut}
                      onClick={() => handleCheckout('WEBPAY')}
                      className="flex items-center justify-center gap-2 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-black text-sm transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)]"
                    >
                      <CreditCard size={18} /> Pagar Online
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-mono">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    Transacción cifrada y canalizada al Isolate Edge
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Vintage Minimalista */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 text-neutral-500 text-xs py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-amber-400 flex items-center justify-center text-amber-400 font-bold text-[10px]">
              T
            </div>
            <span className="font-bold text-neutral-300">TIEMPO FOODTRUCK</span>
            <span className="text-neutral-600">|</span>
            <span>para un antojo perfecto</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400 font-mono text-[11px]">
            <span>SANDWICHES • COMPLETOS • PAPAS</span>
            <span className="text-neutral-600">•</span>
            <span className="text-amber-400 font-bold">📍 SECTOR CONCEPCIÓN, REGIÓN DEL BIOBÍO, CHILE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
