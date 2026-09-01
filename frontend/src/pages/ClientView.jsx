import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Download, X, Check, SlidersHorizontal } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

const AVAILABLE_EXTRAS = [
  { id: 'champ', name: 'Champiñón', price: 1000 },
  { id: 'choclo', name: 'Choclo', price: 1000 },
  { id: 'queso', name: 'Queso Fundido', price: 1000 },
  { id: 'poroto', name: 'Poroto Verde', price: 1000 }
];

const BREAD_OPTIONS = [
  'Pan Marraqueta',
  'Pan de Hamburguesa'
];

function CategoryRibbon({ title }) {
  return (
    <div className="relative my-10 sm:my-12 flex items-center justify-center select-none">
      <div className="relative z-10 px-8 sm:px-12 py-2.5 sm:py-3 bg-[#0c0c10] border-2 border-amber-400/90 text-amber-300 font-black tracking-[0.2em] uppercase text-lg sm:text-2xl shadow-[0_0_25px_rgba(251,191,36,0.25)] rounded-md font-serif">
        <span>{title}</span>
      </div>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-amber-400/25"></div>
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

  // Modal de Personalización (Ingredientes Extra y Pan)
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [selectedBread, setSelectedBread] = useState('Pan Marraqueta');

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
    setTimeout(() => setNotification(null), 2200);
  };

  // Abrir modal de personalización o añadir directo si no aplica
  const handleItemClick = (item) => {
    if (!isOpen) {
      showToast('Cocina cerrada por hoy (Horario hasta las 18:00)', true);
      return;
    }

    // Categorías con soporte de agregados extra
    if (['SANDWICHES', 'COMPLETOS', 'PAPAS FRITAS'].includes(item.category)) {
      setCustomizingItem(item);
      setSelectedExtras([]);
      setSelectedBread('Pan Marraqueta');
    } else {
      addDirectToCart(item);
    }
  };

  const addDirectToCart = (item) => {
    if (!isOpen) {
      showToast('Cocina cerrada por hoy (Horario hasta las 18:00)', true);
      return;
    }
    setCart(prev => {
      const cartKey = item.id;
      const existing = prev.find(i => i.cartKey === cartKey);
      if (existing) {
        return prev.map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, cartKey, extras: [], bread: null, finalUnitPrice: item.price, quantity: 1 }];
    });
    showToast(`Añadido: ${item.name}`);
  };

  const confirmCustomItem = () => {
    if (!customizingItem) return;

    const extrasCost = selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
    const finalUnitPrice = customizingItem.price + extrasCost;
    const extrasKey = selectedExtras.map(e => e.id).sort().join('_');
    const breadKey = customizingItem.category === 'SANDWICHES' ? selectedBread : '';
    const cartKey = `${customizingItem.id}_${extrasKey}_${breadKey}`;

    setCart(prev => {
      const existing = prev.find(i => i.cartKey === cartKey);
      if (existing) {
        return prev.map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [
        ...prev,
        {
          ...customizingItem,
          cartKey,
          extras: [...selectedExtras],
          bread: customizingItem.category === 'SANDWICHES' ? selectedBread : null,
          finalUnitPrice,
          quantity: 1
        }
      ];
    });

    showToast(`Añadido: ${customizingItem.name}`);
    setCustomizingItem(null);
  };

  const toggleExtra = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.some(e => e.id === extra.id);
      if (exists) {
        return prev.filter(e => e.id !== extra.id);
      }
      return [...prev, extra];
    });
  };

  const removeFromCart = (cartKey) => {
    setCart(prev => {
      const existing = prev.find(i => i.cartKey === cartKey);
      if (existing && existing.quantity === 1) {
        return prev.filter(i => i.cartKey !== cartKey);
      }
      return prev.map(i => i.cartKey === cartKey ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const total = cart.reduce((sum, item) => sum + (item.finalUnitPrice || item.price) * item.quantity, 0);

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
      alert('Error en conexión con el servidor.');
    }
    setCheckingOut(false);
  };

  const CATEGORY_SECTIONS = [
    { key: 'SANDWICHES', title: 'SANDWICHES' },
    { key: 'PAPAS FRITAS', title: 'PAPAS FRITAS' },
    { key: 'SOPAÍPILLAS', title: 'SOPAÍPILLAS' },
    { key: 'COMPLETOS', title: 'COMPLETOS' },
    { key: 'BEBESTIBLES', title: 'BEBESTIBLES' },
    { key: 'AGREGADOS', title: 'AGREGADOS' }
  ];

  const filteredCategories = activeCategory === 'TODOS' 
    ? CATEGORY_SECTIONS 
    : CATEGORY_SECTIONS.filter(c => c.key === activeCategory);

  const currentModalPrice = customizingItem 
    ? customizingItem.price + selectedExtras.reduce((sum, e) => sum + e.price, 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#09090c] text-neutral-100 font-sans selection:bg-amber-400 selection:text-neutral-950 relative overflow-x-hidden">
      
      {/* Resplandor Atmosférico */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse duration-10000" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] font-bold px-6 py-3 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-2.5 text-sm sm:text-base border ${
              notification.isError 
                ? 'bg-red-600 text-white border-red-400' 
                : 'bg-amber-400 text-neutral-950 border-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${notification.isError ? 'bg-white' : 'bg-neutral-950'} shrink-0`} />
            <span className="leading-tight">{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Logo */}
      <header className="relative z-10 pt-6 sm:pt-10 pb-6 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* Barra Superior */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 mb-8 border-b border-neutral-800/80 pb-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm font-mono">
            {isOpen ? (
              <span className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>COCINA ABIERTA</span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-300">Cierre: <strong className="text-emerald-300 font-bold">{timeLeft}</strong></span>
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-red-950/70 border border-red-500/40 text-red-400 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>COCINA CERRADA (HASTA 18:00)</span>
              </span>
            )}
            <span className="text-neutral-700 hidden md:inline">|</span>
            <span className="text-neutral-300 font-medium px-2 py-1">
              Concepción, Chile
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="/Carta_Tiempo.pdf" 
              download
              className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 px-4 py-2 rounded-full text-neutral-200 hover:text-amber-400 transition-all shadow-md active:scale-95"
            >
              <Download size={15} className="text-amber-400" /> Descargar Carta PDF
            </a>
          </div>
        </div>

        {/* Emblema Circular */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 20 }}
          className="relative group mb-4"
        >
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-amber-400/90 bg-[#0d0d12] p-4 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 border-[6px] border-dashed border-amber-400 rounded-full animate-[spin_80s_linear_infinite]" />
            <span className="font-black text-3xl sm:text-4xl tracking-tighter text-amber-400 uppercase leading-none font-serif drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)]">
              TIEMPO
            </span>
            <span className="text-[11px] sm:text-xs text-neutral-300 italic font-serif tracking-tight mt-1.5 opacity-90">
              para un antojo perfecto
            </span>
          </div>
        </motion.div>

        {/* Título */}
        <motion.h1 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-wider uppercase text-white font-serif drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]"
        >
          NUESTRO MENÚ
        </motion.h1>
        <p className="text-neutral-300 text-sm sm:text-base max-w-xl mt-2.5 font-normal leading-relaxed">
          Comida tradicional preparada en el momento. Personaliza tus sándwiches y completos con nuestros agregados frescos.
        </p>

        {/* Filtro de Categorías */}
        <div className="w-full flex items-center justify-start sm:justify-center overflow-x-auto gap-2 mt-8 pb-3 pt-1 px-2 no-scrollbar">
          <button
            onClick={() => setActiveCategory('TODOS')}
            className={`relative px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-200 shrink-0 ${
              activeCategory === 'TODOS'
                ? 'bg-amber-400 text-neutral-950 font-black shadow-[0_0_20px_rgba(251,191,36,0.45)] scale-105'
                : 'bg-neutral-900/90 text-neutral-300 border border-neutral-700/80 hover:border-amber-400/50 hover:text-white'
            }`}
          >
            TODOS LOS PLATOS
          </button>
          {CATEGORY_SECTIONS.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`relative px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-all duration-200 shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-amber-400 text-neutral-950 font-black shadow-[0_0_20px_rgba(251,191,36,0.45)] scale-105'
                  : 'bg-neutral-900/90 text-neutral-300 border border-neutral-700/80 hover:border-amber-400/50 hover:text-white'
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>
      </header>

      {/* Catálogo de Productos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-32 relative z-10">
        {loading ? (
          <div className="text-center py-28">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-mono text-neutral-400 uppercase tracking-widest text-xs">Cargando carta gastronómica...</p>
          </div>
        ) : (
          filteredCategories.map(cat => {
            const itemsInCategory = menu.filter(item => item.category === cat.key);
            if (itemsInCategory.length === 0) return null;

            const isCustomizableCategory = ['SANDWICHES', 'COMPLETOS', 'PAPAS FRITAS'].includes(cat.key);

            return (
              <section key={cat.key} className="mb-14 sm:mb-16">
                <CategoryRibbon title={cat.title} />

                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {itemsInCategory.map(item => (
                    <motion.div
                      key={item.id}
                      variants={cardVariants}
                      whileHover={{ y: -5 }}
                      onClick={() => handleItemClick(item)}
                      className="bg-[#121217] border border-neutral-800 rounded-3xl overflow-hidden hover:border-amber-400/80 hover:shadow-[0_10px_40px_rgba(251,191,36,0.2)] transition-all duration-300 flex flex-col justify-between group relative cursor-pointer"
                    >
                      {/* Imagen Gastronómica */}
                      {item.image_url && (
                        <div className="w-full h-48 sm:h-52 bg-neutral-900 relative overflow-hidden">
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            loading="lazy" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-transparent to-black/30" />
                          
                          {/* Marca del Producto */}
                          {item.brand && item.brand !== 'Tiempo' && (
                            <span className="absolute top-3 right-3 text-[11px] font-mono font-bold bg-neutral-950/80 backdrop-blur-md text-amber-300 px-3 py-1 rounded-full border border-neutral-700 shadow-sm uppercase">
                              {item.brand}
                            </span>
                          )}

                          {isCustomizableCategory && (
                            <span className="absolute bottom-3 left-3 text-[10px] font-mono font-bold bg-amber-400 text-neutral-950 px-2.5 py-0.5 rounded-full uppercase shadow-md flex items-center gap-1">
                              <SlidersHorizontal size={10} /> Con Agregados
                            </span>
                          )}
                        </div>
                      )}

                      {/* Contenido */}
                      <div className="p-6 flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide group-hover:text-amber-400 transition-colors font-serif leading-tight mb-2">
                            {item.name}
                          </h3>

                          <p className="text-neutral-300 text-sm sm:text-base font-normal leading-relaxed mb-6">
                            {item.description}
                          </p>
                        </div>

                        {/* Precio y Acción */}
                        <div className="flex items-center justify-between pt-4 border-t border-neutral-800/80 mt-auto">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-semibold">Precio</span>
                            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]">
                              ${item.price.toLocaleString('es-CL')}
                            </span>
                          </div>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemClick(item);
                            }}
                            className="w-12 h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 flex items-center justify-center font-black shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all group-hover:scale-105 active:bg-amber-500"
                            title="Añadir"
                            aria-label={`Añadir ${item.name}`}
                          >
                            <Plus size={24} strokeWidth={3} />
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

      {/* Modal de Personalización (Ingredientes Extra / Pan) */}
      <AnimatePresence>
        {customizingItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomizingItem(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-[110]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full max-w-lg bg-[#111116] border-2 border-amber-400/60 rounded-3xl z-[120] p-6 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Cabecera del Modal */}
              <div className="flex justify-between items-start border-b border-neutral-800 pb-4 mb-4">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase font-serif">{customizingItem.name}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{customizingItem.description}</p>
                </div>
                <button
                  onClick={() => setCustomizingItem(null)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto space-y-6 pr-1 flex-grow">
                {/* Selección de Pan (Solo para Sandwiches) */}
                {customizingItem.category === 'SANDWICHES' && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-2.5">
                      1. Elige tu tipo de pan
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {BREAD_OPTIONS.map(bread => (
                        <button
                          key={bread}
                          onClick={() => setSelectedBread(bread)}
                          className={`p-3 rounded-xl text-xs sm:text-sm font-bold border text-left transition-all ${
                            selectedBread === bread
                              ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-md font-black'
                              : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          {bread}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agregados Extra (+$1.000 c/u) */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                      {customizingItem.category === 'SANDWICHES' ? '2. Agregados Extras' : 'Agregados Extras'}
                    </h4>
                    <span className="text-[11px] text-neutral-400 font-mono">+$1.000 c/u</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {AVAILABLE_EXTRAS.map(extra => {
                      const isSelected = selectedExtras.some(e => e.id === extra.id);
                      return (
                        <button
                          key={extra.id}
                          onClick={() => toggleExtra(extra)}
                          className={`p-3.5 rounded-xl text-xs sm:text-sm font-bold border flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                              : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <span>{extra.name}</span>
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-mono ${
                            isSelected ? 'bg-amber-400 text-neutral-950 font-black' : 'border border-neutral-700'
                          }`}>
                            {isSelected ? <Check size={12} strokeWidth={3} /> : '+'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Botón de Confirmación con Precio Dinámico */}
              <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 block">Total con agregados</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    ${currentModalPrice.toLocaleString('es-CL')}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={confirmCustomItem}
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-2xl font-black text-sm tracking-wide shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all"
                >
                  Añadir a la Orden
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Carrito Flotante */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-amber-400 text-neutral-950 p-4 sm:p-5 rounded-2xl shadow-[0_12px_40px_rgba(251,191,36,0.5)] border-2 border-neutral-950 flex items-center gap-3 font-black transition-all"
        aria-label="Abrir carrito"
      >
        <ShoppingCart size={24} strokeWidth={2.5} />
        {cart.length > 0 && (
          <span className="bg-neutral-950 text-amber-400 text-xs sm:text-sm font-mono font-bold px-3 py-1 rounded-full border border-amber-400">
            {cart.reduce((s, i) => s + i.quantity, 0)} • ${total.toLocaleString('es-CL')}
          </span>
        )}
      </motion.button>

      {/* Cajón de Pedido / Checkout */}
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
              className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#101014] border-l-2 border-amber-400/40 z-[90] flex flex-col shadow-2xl"
            >
              {/* Cabecera del Pedido */}
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase font-serif">Tu Pedido</h2>
                  <p className="text-xs text-neutral-400 font-medium">Revisa y envía a cocina</p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                  aria-label="Cerrar pedido"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Lista de Platos con Detalle de Extras */}
              <div className="flex-grow overflow-y-auto p-6 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <p className="font-bold text-neutral-300 text-lg">Tu canasta está vacía</p>
                    <p className="text-xs text-neutral-500 max-w-xs mt-1">Selecciona cualquier plato del menú para comenzar tu orden.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <motion.div
                      layout
                      key={item.cartKey}
                      className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex justify-between items-start shadow-sm"
                    >
                      <div className="flex-1 pr-3">
                        <h4 className="font-bold text-sm sm:text-base text-white uppercase leading-tight">{item.name}</h4>
                        
                        {/* Pan seleccionado */}
                        {item.bread && (
                          <div className="text-[11px] font-mono text-amber-300/90 mt-0.5">
                            🍞 {item.bread}
                          </div>
                        )}

                        {/* Extras seleccionados */}
                        {item.extras && item.extras.length > 0 && (
                          <div className="text-[11px] text-neutral-400 mt-1 space-y-0.5">
                            {item.extras.map(e => (
                              <span key={e.id} className="inline-block bg-neutral-800 px-1.5 py-0.5 rounded text-[10px] mr-1 text-neutral-300">
                                + {e.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-amber-400 font-mono font-bold text-sm mt-2">
                          ${((item.finalUnitPrice || item.price) * item.quantity).toLocaleString('es-CL')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 p-1.5 rounded-xl shrink-0">
                        <button
                          onClick={() => removeFromCart(item.cartKey)}
                          className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white"
                          aria-label="Disminuir"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-sm text-amber-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            setCart(prev => prev.map(i => i.cartKey === item.cartKey ? { ...i, quantity: i.quantity + 1 } : i));
                          }}
                          className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-300 hover:text-white"
                          aria-label="Aumentar"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Total y Checkout */}
              {cart.length > 0 && (
                <div className="p-6 bg-neutral-950 border-t border-neutral-800 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-neutral-400 font-mono text-xs uppercase font-bold">Total a Pagar</span>
                    <span className="text-3xl font-black text-amber-400 font-mono">
                      ${total.toLocaleString('es-CL')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      disabled={checkingOut}
                      onClick={() => handleCheckout('CASH')}
                      className="py-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold text-sm transition-all border border-neutral-700 active:scale-98"
                    >
                      Pago Efectivo
                    </button>
                    <button
                      disabled={checkingOut}
                      onClick={() => handleCheckout('WEBPAY')}
                      className="py-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-black text-sm transition-all shadow-[0_0_20px_rgba(251,191,36,0.35)] active:scale-98"
                    >
                      Pagar Webpay
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Vintage */}
      <footer className="border-t border-neutral-800/80 bg-[#07070a] text-neutral-400 text-xs py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">TIEMPO FOODTRUCK</span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400 italic">para un antojo perfecto</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-neutral-400 font-mono text-xs">
            <span>SANDWICHES • COMPLETOS • PAPAS</span>
            <span className="text-neutral-600">•</span>
            <span className="text-amber-400 font-bold">CONCEPCIÓN, CHILE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
