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
      <motion.div
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 100, opacity: 0, scale: 0.9 }}
        className="lg:hidden fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] w-auto whitespace-nowrap"
      >
        <div 
          onClick={() => navigate('/cart')}
          className="flex items-center bg-[#080808]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 pl-7 gap-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] cursor-pointer group hover:border-primary/30 transition-all active:scale-95"
        >
          {/* Order Info Section */}
          <div className="flex flex-col">
            <span className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mb-0.5">Your Order</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] font-bold text-text-muted">Rs.</span>
              <span className="text-xl font-display text-white tracking-tight">{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="relative">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,102,0,0.3)] group-hover:shadow-[0_0_40px_rgba(255,102,0,0.5)] transition-all">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-white" strokeWidth={2.5} />
                {/* Count Badge */}
                <motion.span 
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 bg-white text-primary text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-xl border-2 border-primary"
                >
                  {cartCount}
                </motion.span>
              </div>
            </div>
            
            {/* Pulsing Outer Ring */}
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-40 -z-10" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
