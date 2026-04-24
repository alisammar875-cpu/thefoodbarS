import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import MenuCard from '../components/MenuCard';
import Modal from '../components/Modal';
import SkeletonCard from '../components/SkeletonCard';
import { Search, X, Star, Clock, Utensils, Minus, Plus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useConfig } from '../contexts/ConfigContext';
import logo from '../assets/logo.png';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemQty, setItemQty] = useState(1);
  
  const { addItem } = useCart();
  const { addToast } = useToast();
  const { config } = useConfig();

  useEffect(() => {
    const loadData = async () => {
      try {
        const catSnap = await getDocs(query(collection(db, 'categories'), orderBy('displayOrder', 'asc')));
        setCategories([{ id: 'all', name: 'All', emoji: '🍽️' }, ...catSnap.docs.map(d => ({ id: d.id, ...d.data() }))]);

        const itemsSnap = await getDocs(collection(db, 'menu_items'));
        setMenuItems(itemsSnap.docs.map(d => ({id: d.id, ...d.data()})));
      } catch (error) {
        console.error("Error loading menu data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = () => {
    if (!selectedItem || !config.isAcceptingOrders) return;
    addItem(selectedItem, itemQty);
    addToast(`${selectedItem.name} added to cart!`, 'success');
    setSelectedItem(null);
    setItemQty(1);
  };

  return (
    <div className="pt-32 pb-32 min-h-screen container mx-auto px-4 relative">
      {/* Background Watermark Logo */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none z-0">
        <img src={logo} alt="" className="w-[300px] md:w-[600px] lg:w-[800px] object-contain" />
      </div>

      <div className="max-w-4xl mx-auto text-center mb-20 relative z-10">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary font-bold tracking-[0.4em] uppercase text-xs mb-4 block"
        >
          Signature Flavors
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-display mb-6 tracking-tighter"
        >
          EXPLORE OUR <span className="text-primary">MENU</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-text-muted text-lg font-medium leading-relaxed"
        >
          From legendary smash burgers to artisanal wraps, every item is crafted with premium ingredients and a passion for bold flavors.
        </motion.p>
      </div>

      {/* Filters and Search Container - Sticky on scroll */}
      <div className="sticky top-20 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4 md:py-6 mb-12 md:mb-16 -mx-4 px-4 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 items-center">
          {/* Search Bar - Centered and wide on desktop */}
          <div className="relative w-full lg:max-w-2xl group order-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search flavors..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] py-4 md:py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/20"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 md:right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white bg-white/10 p-1 rounded-full"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Categories - Scrollable on mobile, wrapping on desktop */}
          <div className="flex flex-nowrap lg:flex-wrap lg:justify-center gap-2 md:gap-3 overflow-x-auto lg:overflow-visible w-full pb-2 lg:pb-0 custom-scrollbar hide-scroll-mobile order-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.name); setSearchParams({ category: cat.name }); }}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl whitespace-nowrap font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all border flex items-center gap-2 md:gap-3 ${
                  activeCategory === cat.name 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white/5 text-text-muted border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                <span className="text-base md:text-lg leading-none">{cat.emoji}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <SkeletonCard count={8} />
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-32 glass-card border-dashed border-white/10 max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-primary opacity-50" />
          </div>
          <h3 className="text-3xl font-display mb-4 uppercase tracking-wider">No matches found</h3>
          <p className="text-text-muted font-medium mb-8">We couldn't find any items matching your criteria. Try different search terms or browse another category.</p>
          <button 
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); setSearchParams({}); }}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase tracking-widest text-xs transition-all border border-white/10"
          >
            Clear Filters
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <MenuCard key={item.id} item={item} onView={setSelectedItem} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal isOpen={!!selectedItem} onClose={() => { setSelectedItem(null); setItemQty(1); }}>
          <div className="max-w-xl mx-auto overflow-hidden rounded-[2.5rem]">
            <div className="h-56 sm:h-64 w-full relative">
              <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover shadow-2xl" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                {selectedItem.isFeatured && <span className="bg-primary text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-xl">Featured</span>}
                {selectedItem.isNew && <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-xl">New</span>}
              </div>
            </div>
            <div className="p-6 md:p-8 -mt-10 relative z-10 bg-[#080808] rounded-t-3xl border-t border-white/5">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <span className="bg-primary/10 text-primary text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.2em]">{selectedItem.category}</span>
                  <h2 className="text-3xl font-display mt-2 tracking-tight uppercase leading-none">{selectedItem.name}</h2>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-display text-primary tracking-tighter">Rs. {selectedItem.price}</span>
                </div>
              </div>
  
              <p className="text-text-muted text-[11px] leading-relaxed mb-6 font-medium line-clamp-3">{selectedItem.description || selectedItem.shortDescription}</p>
  
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                  <Clock className="w-4 h-4 text-primary mb-1" />
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Prep</p>
                  <p className="text-[10px] font-bold">{selectedItem.prepTimeMinutes || 15}m</p>
                </div>
                <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                  <Utensils className="w-4 h-4 text-primary mb-1" />
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Cals</p>
                  <p className="text-[10px] font-bold">{selectedItem.calories || 'N/A'}</p>
                </div>
                <div className="bg-white/[0.02] p-3 rounded-2xl border border-white/5 flex flex-col items-center">
                  <Star className="w-4 h-4 text-secondary mb-1 fill-current" />
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mb-1">Rate</p>
                  <p className="text-[10px] font-bold">{selectedItem.averageRating?.toFixed(1) || '4.8'}</p>
                </div>
              </div>
  
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                  <button onClick={() => setItemQty(Math.max(1, itemQty - 1))} className="text-text-muted hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="w-6 text-center font-display text-xl">{itemQty}</span>
                  <button onClick={() => setItemQty(itemQty + 1)} className="text-text-muted hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                
                <motion.button
                  whileTap={(selectedItem.isAvailable && config.isAcceptingOrders) ? { scale: 0.98 } : {}}
                  onClick={handleAddToCart}
                  disabled={!selectedItem.isAvailable || !config.isAcceptingOrders}
                  className="flex-1 py-4 bg-primary text-white rounded-xl font-bold tracking-[0.2em] uppercase text-xs shadow-2xl shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                >
                  {!config.isAcceptingOrders ? 'Closed' : selectedItem.isAvailable ? <><ShoppingBag className="w-4 h-4" /> Add — Rs. {selectedItem.price * itemQty}</> : 'Sold Out'}
                </motion.button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
