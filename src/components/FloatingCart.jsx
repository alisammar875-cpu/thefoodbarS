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

  const [dragProgress, setDragProgress] = React.useState(0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="lg:hidden fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] w-[280px]"
      >
        <div className="relative h-16 bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] flex items-center p-1.5 overflow-hidden">
          {/* Animated Background Text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.p 
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-10"
            >
              Slide to View Cart
            </motion.p>
          </div>

          {/* Draggable Handle */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 200 }}
            dragElastic={0.1}
            onDrag={(e, info) => setDragProgress(info.point.x)}
            onDragEnd={(e, info) => {
              if (info.offset.x > 150) {
                navigate('/cart');
              }
            }}
            className="relative z-20 w-[52px] h-[52px] bg-primary rounded-full flex items-center justify-center shadow-xl cursor-grab active:cursor-grabbing border-2 border-white/20"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 text-white" strokeWidth={2.5} />
              <span className="absolute -top-2 -right-2 bg-white text-primary text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-lg border border-primary">
                {cartCount}
              </span>
            </div>
          </motion.div>

          {/* Price Display */}
          <div className="flex-1 text-right pr-6 z-10">
            <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Total Pay</p>
            <p className="text-lg font-display text-white leading-none tracking-tight">Rs. {cartTotal.toLocaleString()}</p>
          </div>

          {/* Progress Overlay */}
          <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-primary/10 pointer-events-none"
            style={{ width: dragProgress + 60 }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
