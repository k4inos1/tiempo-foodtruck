import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Plus, Minus, CreditCard, Banknote, ShieldCheck, 
  Download, Clock, Flame, UtensilsCrossed, Sparkles, Check, ChevronRight,
  Coffee, Zap, Layers, AlertCircle, MapPin
} from 'lucide-react';

// Variantes de animación física ultra-suave
const containerMotion = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05
    }
  }
};

const itemMotion = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  }
};

// Componente: Cinta de Título Vintage con Alto Contraste
function CategoryRibbon({ title, icon: Icon }) {
  return (
    <div className="relative my-8 sm:my-10 flex items-center justify-center select-none">
      <div className="relative z-10 inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-10 py-2.5 sm:py-3 bg-[#0d0d11] border-2 border-amber-400 text-amber-300 font-black tracking-widest uppercase text-base sm:text-xl md:text-2xl shadow-[0_0_20px_rgba(251,191,36,0.3)] rounded-lg">
        {Icon && <Icon size={22} className="text-amber-400 shrink-0" />}
        <span className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{title}</span>
      </div>
      {/* Línea dorada de separación con brillo */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-amber-400/30"></div>
      </div>
    </div>
  );
}

export default function ClientView() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [activeCategory, setActiveCategory] = useState('TODOS');
  const [notification, setNotification] = useState(null);

  // Horario de atención: Cierre estricto a las 18:00 hrs
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
      showToast('Cocina cerrada por hoy (Horario de atención hasta las 18:00)', true);
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
    <div className="min-h-screen bg-[#08080a] text-neutral-100 font-sans selection:bg-amber-400 selection:text-neutral-950 relative overflow-x-hidden">
      
      {/* Fondo Chalkboard con textura */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20 z-0 bg-[radial-gradient(#f59e0b_1.5px,transparent_1.5px)] [background-size:28px_28px]"
      />

      {/* Toast Notification Flotante con Alto Contraste */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] font-black px-6 py-3.5 rounded-full shadow-[0_0_35px_rgba(0,0,0,0.9)] flex items-center gap-2.5 text-sm sm:text-base border-2 max-w-[90vw] text-center ${
              notification.isError 
                ? 'bg-red-600 text-white border-white shadow-red-500/50' 
                : 'bg-amber-400 text-neutral-950 border-neutral-950 shadow-amber-400/50'
            }`}
          >
            {notification.isError ? <AlertCircle size={20} strokeWidth={3} className="shrink-0" /> : <Check size={20} strokeWidth={3} className="shrink-0" />}
            <span className="leading-tight">{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Logo estilo Volante Oficial */}
      <header className="relative z-10 pt-6 sm:pt-10 pb-6 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Top Navbar Actions (Responsivo) */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 mb-6 sm:mb-8 border-b border-neutral-800/80 pb-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm font-mono font-bold tracking-wider">
            {isOpen ? (
              <span className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-3.5 py-1.5 rounded-full shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block shrink-0" />
                <span>COCINA ABIERTA</span>
                <span className="text-neutral-500">•</span>
                <span>CIERRA EN: <strong className="text-white font-mono">{timeLeft}</strong></span>
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-red-950/90 border border-red-500/50 text-red-300 px-3.5 py-1.5 rounded-full shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shrink-0" />
                <span>COCINA CERRADA (HASTA 18:00)</span>
              </span>
            )}
            <span className="text-neutral-600 hidden md:inline">|</span>
            <span className="text-neutral-200 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs sm:text-sm">
              <MapPin size={14} className="text-amber-400 shrink-0" />
              <span>SECTOR CONCEPCIÓN, CHILE</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="/Carta_Tiempo.pdf" 
              download
              className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-full text-neutral-100 hover:text-amber-400 transition-all shadow-md active:scale-95"
            >
              <Download size={16} className="text-amber-400" /> Descargar Carta PDF
            </a>
          </div>
        </div>

        {/* Emblema Circular TIEMPO con Escala Dinámica */}
        <motion.div 
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="relative group mb-3 sm:mb-4"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-4 border-amber-400 bg-[#0d0d11] p-3 flex flex-col items-center justify-center shadow-[0_0_45px_rgba(251,191,36,0.35)] relative overflow-hidden">
            {/* Esfera con rotación suave */}
            <div className="absolute inset-0 opacity-20 border-[8px] border-dashed border-amber-400 rounded-full animate-[spin_60s_linear_infinite]" />
            <Clock size={36} className="text-amber-400 mb-1 shrink-0 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" strokeWidth={2.5} />
            <span className="font-black text-2xl sm:text-3xl tracking-tighter text-amber-400 uppercase leading-none font-serif">
              TIEMPO
            </span>
            <span className="text-[10px] sm:text-xs text-neutral-200 italic font-medium tracking-tight mt-1">
              para un antojo perfecto
            </span>
          </div>
        </motion.div>

        {/* Título Principal de Máxima Legibilidad */}
        <motion.h1 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-wider uppercase text-white font-serif drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
        >
          NUESTRO MENÚ
        </motion.h1>
        <p className="text-neutral-300 text-sm sm:text-base max-w-xl mt-2 font-normal leading-relaxed px-2">
          Selección artesanal preparada al momento en Concepción, Chile. Ingredientes frescos, porciones generosas y sabor tradicional.
        </p>

        {/* Selector de Categorías Horizontal con soporte Touch / Snap en móviles */}
        <div className="w-full flex items-center justify-start sm:justify-center overflow-x-auto gap-2 mt-6 sm:mt-8 pb-3 pt-1 px-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory('TODOS')}
            className={`px-4 sm:px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-200 shrink-0 ${
              activeCategory === 'TODOS'
                ? 'bg-amber-400 text-neutral-950 shadow-[0_0_20px_rgba(251,191,36,0.45)] font-black scale-105'
                : 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-amber-400/60 hover:text-white'
            }`}
          >
            ★ TODOS LOS PLATOS
          </button>
          {CATEGORY_SECTIONS.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 sm:px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-200 shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-amber-400 text-neutral-950 shadow-[0_0_20px_rgba(251,191,36,0.45)] font-black scale-105'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:border-amber-400/60 hover:text-white'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </header>

      {/* Grid del Menú por Categorías (Ultra Responsivo) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 relative z-10">
        {loading ? (
          <div className="text-center py-24">
            <Clock className="animate-spin text-amber-400 mx-auto mb-4" size={48} />
            <p className="font-mono text-neutral-300 uppercase tracking-widest text-sm">Sincronizando con la carta oficial...</p>
          </div>
        ) : (
          filteredCategories.map(cat => {
            const itemsInCategory = menu.filter(item => item.category === cat.key);
            if (itemsInCategory.length === 0) return null;

            return (
              <section key={cat.key} className="mb-12 sm:mb-16">
                <CategoryRibbon title={cat.title} icon={cat.icon} />

                <motion.div 
                  variants={containerMotion}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                >
                  {itemsInCategory.map(item => (
                    <motion.div
                      key={item.id}
                      variants={itemMotion}
                      whileHover={{ y: -4, scale: 1.01 }}
                      className="bg-[#141419] border border-neutral-700/80 rounded-2xl sm:rounded-3xl overflow-hidden hover:border-amber-400/80 hover:shadow-[0_8px_35px_rgba(251,191,36,0.2)] transition-all duration-300 flex flex-col justify-between group relative"
                    >
                      {/* Imagen Stock con Proporción 16:9 Adaptativa */}
                      {item.image_url && (
                        <div className="w-full h-48 sm:h-52 bg-neutral-900 relative overflow-hidden">
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            loading="lazy" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#141419] via-transparent to-black/35" />
                          
                          {/* Badge de Marca */}
                          {item.brand && item.brand !== 'Tiempo' && (
                            <span className="absolute top-3 right-3 text-xs font-mono font-bold bg-neutral-950/90 backdrop-blur-md text-amber-300 px-3 py-1 rounded-lg border border-neutral-700 shadow-md uppercase tracking-wider">
                              {item.brand}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Contenido con Alto Contraste y Tipografía Refinada */}
                      <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
                        <div>
                          {/* Título del Producto */}
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide group-hover:text-amber-400 transition-colors font-serif leading-tight">
                              {item.name}
                            </h3>
                          </div>

                          {/* Descripción de Ingredientes (Alta legibilidad) */}
                          <p className="text-neutral-300 text-sm sm:text-base font-normal leading-relaxed mb-6">
                            {item.description}
                          </p>
                        </div>

                        {/* Pie de tarjeta: Precio & Botón de Añadir Accesible */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest font-semibold">Precio Oficial</span>
                            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]">
                              ${item.price.toLocaleString('es-CL')}
                            </span>
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addToCart(item)}
                            className="w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 flex items-center justify-center font-black shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all group-hover:scale-105 active:bg-amber-500"
                            title="Añadir a la orden"
                            aria-label={`Añadir ${item.name}`}
                          >
                            <Plus size={26} strokeWidth={3} />
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

      {/* Floating Action Button (Carrito Flotante Móvil & Desktop) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 bg-amber-400 text-neutral-950 p-4 sm:p-5 rounded-2xl shadow-[0_12px_40px_rgba(251,191,36,0.5)] border-2 border-neutral-950 flex items-center gap-3 font-black transition-all"
        aria-label="Abrir carrito de compras"
      >
        <ShoppingCart size={26} strokeWidth={2.5} />
        {cart.length > 0 && (
          <span className="bg-neutral-950 text-amber-400 text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-full border border-amber-400">
            {cart.reduce((s, i) => s + i.quantity, 0)} • ${total.toLocaleString('es-CL')}
          </span>
        )}
      </motion.button>

      {/* Drawer del Carrito / Checkout Adaptativo */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-[80]"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#111115] border-l-2 border-amber-400/40 z-[90] flex flex-col shadow-2xl"
            >
              {/* Encabezado del Carrito */}
              <div className="p-5 sm:p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-xl border border-amber-400/30">
                    <ShoppingCart size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white uppercase font-serif">Tu Pedido</h2>
                    <p className="text-xs text-neutral-400 font-medium">Revisa y confirma tu orden</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                  aria-label="Cerrar pedido"
                >
                  <Minus size={22} />
                </button>
              </div>

              {/* Lista de Items con Scroll Cómodo */}
              <div className="flex-grow overflow-y-auto p-5 sm:p-6 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <UtensilsCrossed size={52} className="text-neutral-700 mb-4 animate-bounce" />
                    <p className="font-bold text-neutral-200 text-lg sm:text-xl">Tu canasta está vacía</p>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-xs mt-1">Selecciona cualquier plato de la carta para comenzar tu orden.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <motion.div
                      layout
                      key={item.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex justify-between items-center shadow-sm"
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="font-bold text-sm sm:text-base text-neutral-100 uppercase">{item.name}</h4>
                        <span className="text-amber-400 font-mono font-bold text-sm sm:text-base">
                          ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-1.5 rounded-lg">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-sm sm:text-base text-amber-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-300 hover:text-white"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Checkout y Total */}
              {cart.length > 0 && (
                <div className="p-5 sm:p-6 bg-neutral-950 border-t border-neutral-800 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-400 font-mono text-xs sm:text-sm uppercase font-bold">Total a Pagar</span>
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      ${total.toLocaleString('es-CL')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={checkingOut}
                      onClick={() => handleCheckout('CASH')}
                      className="flex items-center justify-center gap-2 py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold text-sm sm:text-base transition-all border border-neutral-700 active:scale-98"
                    >
                      <Banknote size={20} /> Efectivo
                    </button>
                    <button
                      disabled={checkingOut}
                      onClick={() => handleCheckout('WEBPAY')}
                      className="flex items-center justify-center gap-2 py-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-black text-sm sm:text-base transition-all shadow-[0_0_20px_rgba(251,191,36,0.35)] active:scale-98"
                    >
                      <CreditCard size={20} /> Pagar Online
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 font-mono text-center">
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                    <span>Cifrado Edge AES-256</span>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Vintage con Alta Legibilidad */}
      <footer className="border-t border-neutral-800 bg-[#0a0a0d] text-neutral-300 text-xs sm:text-sm py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full border border-amber-400 flex items-center justify-center text-amber-400 font-bold text-xs">
              T
            </div>
            <span className="font-bold text-white tracking-wider">TIEMPO FOODTRUCK</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-300 italic">para un antojo perfecto</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-neutral-300 font-mono text-xs">
            <span>SANDWICHES • COMPLETOS • PAPAS</span>
            <span className="text-neutral-600">•</span>
            <span className="text-amber-400 font-bold">📍 SECTOR CONCEPCIÓN, REGIÓN DEL BIOBÍO, CHILE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
