import React from 'react';
import { motion } from 'framer-motion';

export default function FoodTruckCard({ truck }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, translateY: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25
      }}
      className="relative p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden group cursor-pointer will-change-transform transform-gpu"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-neutral-100">{truck.name}</h2>
          <span className="flex items-center gap-1 text-amber-400 font-medium bg-amber-400/10 px-2 py-1 rounded-md text-sm">
            ⭐ {truck.rating}
          </span>
        </div>
        <p className="text-neutral-400 mb-6 flex-grow">{truck.description}</p>
        
        <button className="w-full py-2.5 rounded-xl bg-neutral-800 text-neutral-200 font-semibold hover:bg-amber-500 hover:text-neutral-950 transition-colors duration-200">
          View Menu
        </button>
      </div>
    </motion.div>
  );
}
