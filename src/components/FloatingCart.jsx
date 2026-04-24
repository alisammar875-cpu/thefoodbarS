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
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={() => navigate('/cart')}
        className="lg:hidden fixed bottom-24 left-4 right-4 z-[90] bg-primary text-white p-4 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-between border border-white/10 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none mb-1">View Cart</p>
            <p className="text-sm font-bold leading-none">Rs. {cartTotal}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 font-bold text-xs uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg">
          Checkout <ChevronRight className="w-4 h-4" />
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
