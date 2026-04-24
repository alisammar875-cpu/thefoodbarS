import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { cartCount, setIsCartOpen } = useCart();
  const { currentUser, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Track Order', path: '/track' },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled || !isHome ? 'bg-[#0A0A0A] py-4 shadow-xl' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="The Food Bar" className="h-10 md:h-12 w-auto object-contain max-h-[48px]" />
          <span className="text-2xl font-display font-bold tracking-wider text-white hidden sm:block">
            THE FOOD <span className="text-primary">BAR</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`font-medium tracking-wide transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-white hover:text-primary'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <Link to="/menu" className="text-white hover:text-primary transition-colors hidden sm:block">
            <Search className="w-5 h-5" />
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="text-white hover:text-primary transition-colors focus:outline-none"
            >
              <User className="w-5 h-5" />
            </button>
            
            {/* User Dropdown */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 glass-card py-2 flex flex-col z-50"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  {currentUser ? (
                    <>
                      <Link to="/profile" className="px-4 py-2 hover:bg-white/5 transition-colors" onClick={() => setIsUserMenuOpen(false)}>My Profile</Link>
                      {isAdmin && (
                        <Link to="/admin" className="px-4 py-2 text-secondary hover:bg-white/5 transition-colors" onClick={() => setIsUserMenuOpen(false)}>Admin Portal</Link>
                      )}
                      <button 
                        onClick={() => { logout(); setIsUserMenuOpen(false); }}
                        className="px-4 py-2 text-left text-primary hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="px-4 py-2 hover:bg-white/5 transition-colors" onClick={() => setIsUserMenuOpen(false)}>Login</Link>
                      <Link to="/signup" className="px-4 py-2 hover:bg-white/5 transition-colors" onClick={() => setIsUserMenuOpen(false)}>Sign Up</Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="text-white hover:text-primary transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-[#0A0A0A] z-50 flex flex-col px-6 py-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-12">
              <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                <img src={logo} alt="The Food Bar" className="h-10 w-auto max-h-[40px]" />
                <span className="text-2xl font-display font-bold tracking-wider text-white">
                  THE FOOD <span className="text-primary">BAR</span>
                </span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex flex-col gap-6 text-2xl font-display tracking-wide">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${location.pathname === link.path ? 'text-primary' : 'text-white'}`}
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/10 my-4" />
              {currentUser ? (
                <>
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>MY PROFILE</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-secondary">ADMIN PORTAL</Link>}
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="text-left text-primary">LOGOUT</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>LOGIN</Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>SIGN UP</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
