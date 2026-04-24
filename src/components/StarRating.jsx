import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StarRating({ rating = 0, onChange, size = 'sm', showValue = false, count }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-8 h-8' };
  const iconSize = sizes[size] || sizes.sm;

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((s) => {
        const filled = s <= Math.round(rating);
        return onChange ? (
          <motion.button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="focus:outline-none"
          >
            <Star className={`${iconSize} text-secondary ${filled ? 'fill-current' : 'opacity-30'}`} />
          </motion.button>
        ) : (
          <Star key={s} className={`${iconSize} text-secondary ${filled ? 'fill-current' : 'opacity-30'}`} />
        );
      })}
      {showValue && <span className="ml-1 text-sm font-bold text-white">{Number(rating).toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-text-muted ml-1">({count})</span>}
    </div>
  );
}
