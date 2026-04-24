import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Utensils, ShoppingBag, User, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomNav() {
  const { cartCount } = useCart();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Menu', path: '/menu', icon: Utensils },
    { name: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartCount },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-bg-dark/80 backdrop-blur-xl border-t border-white/10 px-6 py-3 pb-safe">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-white'
              }`
            }
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              <AnimatePresence>
                {item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-bg-dark"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
