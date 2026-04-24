import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Menu as MenuIcon, Tags, Star, Users, LogOut, Menu as HamburgerMenu, X, Settings as SettingsIcon, Bell, ExternalLink, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

export default function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: 'Real-time' },
    { name: 'Menu Items', path: '/admin/menu', icon: MenuIcon },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error(err);
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-[#080808] border-r border-white/5 shadow-2xl">
      <div className="p-8">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <img src={logo} alt="The Food Bar" className="h-8 w-auto max-h-[32px]" />
          <span className="text-xl font-display font-bold tracking-[0.1em] text-white">
            THE FOOD <span className="text-primary">BAR</span>
          </span>
        </Link>
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1 opacity-60">Admin Portal v2.0</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && !isActive && (
                <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate text-white">Administrator</p>
            <p className="text-[10px] text-text-muted truncate uppercase tracking-widest">Active Session</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden font-body text-text-main">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden flex"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 relative z-20 h-full"
            >
              <Sidebar />
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-6 -right-12 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
            <div 
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md z-10"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 md:px-8 bg-[#080808]/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileOpen(true)} 
              className="lg:hidden text-white p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
            >
              <HamburgerMenu className="w-6 h-6" />
            </button>
            <div className="hidden md:block">
              <h2 className="text-xl font-display tracking-widest text-white uppercase">
                {navItems.find(item => location.pathname.includes(item.path))?.name || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest px-4 py-2 bg-white/5 rounded-xl hover:text-white transition-all">
              Live Site <ExternalLink className="w-3 h-3" />
            </a>
            <div className="w-px h-6 bg-white/10 hidden sm:block" />
            <button className="relative text-text-muted hover:text-white p-2.5 bg-white/5 rounded-xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-[#080808]" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto p-6 md:p-10">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
