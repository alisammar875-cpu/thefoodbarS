import React from 'react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function FloatingCart() {
  const { cartItems, cartTotal, cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on cart, checkout, and admin pages
  const hiddenPaths = ['/cart', '/checkout', '/order-success'];
  const isAdmin = location.pathname.startsWith('/admin');
  
  if (hiddenPaths.includes(location.pathname) || isAdmin || cartCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: 20 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/cart')}
        className="lg:hidden fixed bottom-28 right-6 z-[100] w-16 h-16 bg-primary text-white rounded-full shadow-[0_15px_35px_-5px_rgba(255,102,0,0.6)] flex items-center justify-center border-4 border-[#050505] group"
      >
        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 group-hover:hidden" />
        
        <div className="relative z-10">
          <ShoppingBag className="w-7 h-7" strokeWidth={2.5} />
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={cartCount}
            className="absolute -top-3 -right-3 bg-white text-primary text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-xl border-2 border-primary"
          >
            {cartCount}
          </motion.span>
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-active:opacity-100 transition-opacity" />
      </motion.button>
    </AnimatePresence>
  );
}
