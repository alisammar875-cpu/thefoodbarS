import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Eye, Star, Clock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useConfig } from '../contexts/ConfigContext';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

export default function MenuCard({ item, onView }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { config } = useConfig();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!item.isAvailable || !config.isAcceptingOrders) return;
    addItem(item);
    addToast(`${item.name} added to cart!`, 'success');
  };

  const hasBestseller = item.tags?.includes('bestseller');
  const hasNew = item.tags?.includes('new');
  const hasSpicy = item.tags?.includes('spicy');

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 50, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1 } }}
      whileHover={window.innerWidth >= 768 ? { scale: 1.03, y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="glass-card overflow-hidden group cursor-pointer flex flex-col h-full border border-white/5 hover:border-primary/30 transition-all hover:shadow-[0_0_40px_rgba(255,58,31,0.15)]"
      onClick={() => onView(item)}
    >
      <div className="relative h-48 sm:h-56 overflow-hidden bg-black/40">
        {!isImageLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={getOptimizedImageUrl(item.imageUrl, 500, 75)}
          alt={item.name}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Category tag */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span className="text-xs font-accent tracking-widest text-white/90 uppercase">{item.category}</span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {hasBestseller && <span className="bg-secondary/90 text-bg-dark px-2.5 py-0.5 rounded-full text-[10px] font-bold text-center">🔥 HOT</span>}
          {hasNew && <span className="bg-green-500/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold text-center">NEW</span>}
          {hasSpicy && <span className="bg-red-500/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold text-center">🌶</span>}
        </div>

        {/* SOLD OUT overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-primary px-4 py-2 font-display text-2xl rotate-[-10deg] border-2 border-primary text-white shadow-lg">SOLD OUT</span>
          </div>
        )}

        {/* Quick view button */}
        <button
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
          onClick={(e) => { e.stopPropagation(); onView(item); }}
        >
          <Eye className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col relative z-10">
        <h3 className="font-display text-lg sm:text-xl leading-tight line-clamp-1 mb-1">{item.name}</h3>
        <p className="text-text-muted text-[10px] sm:text-xs line-clamp-2 mb-3 flex-1">{item.shortDescription || item.description}</p>

        <div className="flex items-center gap-2 mb-3 text-[10px] sm:text-xs text-text-muted">
          <div className="flex items-center gap-0.5 text-secondary">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            <span className="font-bold text-white">{item.averageRating?.toFixed(1) || '4.8'}</span>
          </div>
          <span className="hidden sm:inline">· {item.reviewCount || 0} reviews</span>
          {item.prepTimeMinutes && <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5 sm:w-3 h-3" /> {item.prepTimeMinutes}m</span>}
        </div>

        <div className="flex justify-between items-center mt-auto">
          <div className="flex flex-col sm:flex-row sm:items-end gap-0.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-display text-primary leading-none">Rs. {item.price}</span>
            {item.originalPrice && (
              <span className="text-[10px] sm:text-xs text-text-muted line-through">Rs. {item.originalPrice}</span>
            )}
          </div>
          <motion.button
            whileTap={(item.isAvailable && config.isAcceptingOrders) ? { scale: 0.9 } : {}}
            onClick={handleAdd}
            disabled={!item.isAvailable || !config.isAcceptingOrders}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg transition-colors ${item.isAvailable && config.isAcceptingOrders ? 'bg-primary hover:bg-primary/80 text-white' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
