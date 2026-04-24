import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, limit, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { seedDatabase } from '../utils/seedData';
import MenuCard from '../components/MenuCard';
import Modal from '../components/Modal';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';
import CountdownTimer from '../components/CountdownTimer';
import SkeletonCard from '../components/SkeletonCard';
import { ArrowRight, Star, Clock, Users, ShieldCheck, Minus, Plus, Utensils, Zap, Award, ShoppingBag, History, Coins } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

// Count-up hook
function useCountUp(target, duration = 2000, start) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setCount(target);
      return;
    }
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration, start]);
  return count;
}

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemQty, setItemQty] = useState(1);
  const [siteConfig, setSiteConfig] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(sessionStorage.getItem('tfb_banner_dismissed') === 'true');
  const [liveStats, setLiveStats] = useState({ items: 50, delivery: 30, orders: 5000, rating: 4.8 });
  const [lastOrder, setLastOrder] = useState(null);
  const [loadingLastOrder, setLoadingLastOrder] = useState(false);

  const { addItem } = useCart();
  const { addToast } = useToast();
  const { config } = useConfig();
  const { currentUser, userProfile } = useAuth();

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });

  const s1 = useCountUp(liveStats.items, 2000, statsInView);
  const s2 = useCountUp(liveStats.delivery, 2000, statsInView);
  const s3 = useCountUp(liveStats.orders, 2000, statsInView);
  const s4 = useCountUp(Math.round(liveStats.rating * 10), 2000, statsInView);

  useEffect(() => {
    const loadData = async () => {
      try {
        await seedDatabase();

        // Site Config
        const configSnap = await getDoc(doc(db, 'site_config', 'main'));
        if (configSnap.exists()) setSiteConfig(configSnap.data());

        // Categories
        const catSnap = await getDocs(query(collection(db, 'categories'), orderBy('displayOrder', 'asc')));
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Featured Items
        const featQuery = query(collection(db, 'menu_items'), where('isFeatured', '==', true), limit(8));
        const featSnap = await getDocs(featQuery);
        setFeaturedItems(featSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Highlighted Reviews
        const revQuery = query(collection(db, 'reviews'), where('isHighlighted', '==', true), limit(3));
        const revSnap = await getDocs(revQuery);
        const highlightedReviews = revSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        if (highlightedReviews.length > 0) {
          setReviews(highlightedReviews);
        } else {
          // Fallback to top approved reviews if none highlighted
          const approvedQuery = query(collection(db, 'reviews'), where('isApproved', '==', true), orderBy('rating', 'desc'), limit(3));
          const approvedSnap = await getDocs(approvedQuery);
          setReviews(approvedSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        // Live Stats
        const itemsSnap = await getDocs(collection(db, 'menu_items'));
        const ordersSnap = await getDocs(collection(db, 'orders'));
        const reviewsSnap = await getDocs(collection(db, 'reviews'));
        
        const avgRating = reviewsSnap.size > 0 
          ? reviewsSnap.docs.reduce((acc, d) => acc + d.data().rating, 0) / reviewsSnap.size 
          : 4.8;

        setLiveStats({
          items: itemsSnap.size || 50,
          delivery: configSnap.data()?.estimatedDelivery?.match(/\d+/)?.[0] || 30,
          orders: (ordersSnap.size * 12) + 1240, // Simulated real growth
          rating: avgRating
        });

      } catch (error) {
        console.error("Home Load Error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchLastOrder = async () => {
        setLoadingLastOrder(true);
        try {
          // Fetch orders without complex ordering to avoid index requirement
          const q = query(collection(db, 'orders'), where('customerId', '==', currentUser.uid), limit(10));
          const snap = await getDocs(q);
          if (!snap.empty) {
            // Sort locally by createdAt desc
            const sorted = snap.docs
              .map(d => d.data())
              .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setLastOrder(sorted[0]);
          }
        } catch (e) { console.error(e); }
        setLoadingLastOrder(false);
      };
      fetchLastOrder();
    }
  }, [currentUser]);

  const handleReorder = (order) => {
    if (!order || !order.items) return;
    order.items.forEach(item => addItem(item, item.quantity || 1));
    addToast("Previous order items added to cart!", "success");
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    addItem(selectedItem, itemQty);
    addToast(`${selectedItem.name} added to cart!`, 'success');
    setSelectedItem(null);
    setItemQty(1);
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    sessionStorage.setItem('tfb_banner_dismissed', 'true');
  };

  return (
    <div className="w-full relative">
      {/* Background Watermark Logo */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none z-0">
        <img src={logo} alt="" className="w-[300px] md:w-[600px] lg:w-[800px] object-contain" />
      </div>

      {/* Announcement Banner */}
      <AnimatePresence>
        {config?.announcementBanner && !bannerDismissed && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-secondary text-bg-dark text-center py-3 px-4 text-sm font-bold relative z-50 flex items-center justify-center gap-4 overflow-hidden border-b border-black/10"
          >
            <Zap className="w-4 h-4 animate-pulse" />
            <span className="tracking-wide">{config.announcementBanner}</span>
            <button onClick={() => { setBannerDismissed(true); sessionStorage.setItem('tfb_banner_dismissed', 'true'); }} className="p-1 hover:bg-black/10 rounded-full transition-colors leading-none text-xl">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-[15%] w-[45%] h-[45%] bg-primary/10 rounded-full blur-[60px] md:blur-[120px] md:animate-mesh" />
          <div className="absolute bottom-1/4 right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[60px] md:blur-[120px] md:animate-mesh" style={{ animationDelay: '-8s' }} />
        </div>

        {/* Mobile Background Image (Only on mobile/tablet) */}
        <div className="absolute inset-0 z-0 lg:hidden opacity-20 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=90" 
            alt="" 
            className="w-full h-full object-cover scale-150 rotate-12"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-transparent to-[#080808]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/10 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em]">
                  Now Delivering Across Karachi
                </span>
              </motion.div>
              
              <h1 className="font-display text-5xl md:text-8xl lg:text-9xl leading-[0.9] mb-8 tracking-tighter">
                <motion.span className="block text-white" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>CRAVING</motion.span>
                <motion.span className="block text-primary" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}>SOLVED.</motion.span>
              </h1>

              {/* Deal Timer */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center gap-4 mb-10 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md w-fit mx-auto lg:mx-0"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Flash Deal Ending:</span>
                </div>
                <CountdownTimer hours={2} minutes={45} seconds={12} />
              </motion.div>
              
              <motion.p className="text-base md:text-lg lg:text-xl text-text-muted mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                Experience the gold standard of street food. Handcrafted smashed burgers, artisanal wraps, and blazing-fast delivery.
              </motion.p>
              
              <motion.div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
                <Link to="/menu" className="relative group px-8 py-4 md:px-10 md:py-5 bg-primary text-white rounded-2xl font-bold tracking-[0.1em] uppercase text-xs md:text-sm shadow-2xl shadow-primary/30 active:scale-95 transition-all overflow-hidden flex items-center justify-center gap-3">
                  <span className="relative z-10">Start Order</span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Link>
                <Link to="/menu" className="px-8 py-4 md:px-10 md:py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold tracking-[0.1em] uppercase text-xs md:text-sm active:scale-95 transition-all text-center">
                  View Menu
                </Link>
              </motion.div>

              <motion.div className="flex items-center gap-6 md:gap-8 mt-10 md:mt-12 justify-center lg:justify-start flex-wrap opacity-60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-bg-dark bg-primary/20 flex items-center justify-center text-[9px] md:text-[10px] font-bold">U{i}</div>)}
                  </div>
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">10K+ Orders</span>
                </div>
                <div className="w-px h-4 bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary fill-current" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">4.9 Average</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="relative h-[350px] md:h-[500px] lg:h-[600px] w-full hidden lg:block">
            <motion.div
              className="relative h-full w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.img
                animate={{ y: [-15, 15, -15], rotate: [-1, 1, -1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                src={getOptimizedImageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd", 800, 80)}
                alt="Signature Burger"
                className="w-full h-full object-contain drop-shadow-[0_40px_80px_rgba(255,58,31,0.4)]"
              />
              
              {/* Floating Stat Cards */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-0 glass-card p-4 flex items-center gap-3 border-white/20"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary"><Award className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase">Top Rated</p>
                  <p className="text-sm font-bold">Smash Burger</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [10, -10, 10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-32 left-0 glass-card p-4 flex items-center gap-3 border-white/20"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><Clock className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase">Express Delivery</p>
                  <p className="text-sm font-bold">25-35 Minutes</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ USER DASHBOARD PREVIEW (Points & Reorder) ═══ */}
      {currentUser && (
        <section className="py-12 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Loyalty Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="bg-gradient-to-br from-primary to-accent p-8 rounded-[2rem] shadow-2xl shadow-primary/20 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Coins className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-black/20 px-3 py-1 rounded-full mb-6 inline-block">Loyalty Rewards</span>
                  <h3 className="text-4xl font-display mb-2">POINTS BALANCE</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-display tracking-tighter">{userProfile?.loyaltyPoints || 0}</span>
                    <div className="text-xs font-bold leading-tight opacity-80 uppercase tracking-widest">
                      Earning Points<br />On Every Bite
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/20 flex justify-between items-center">
                    <p className="text-xs font-medium opacity-90">Points can be redeemed for discounts at checkout.</p>
                    <Link to="/profile" className="p-3 bg-white text-primary rounded-xl"><ArrowRight className="w-5 h-5" /></Link>
                  </div>
                </div>
              </motion.div>

              {/* Quick Re-order */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="glass-card p-8 rounded-[2rem] border-white/10 relative overflow-hidden flex flex-col justify-between"
              >
                {loadingLastOrder ? (
                  <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : lastOrder ? (
                  <>
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <History className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Last Order Summary</span>
                      </div>
                      <h3 className="text-2xl font-display mb-4 uppercase">READY TO REPEAT?</h3>
                      <div className="flex gap-4 overflow-x-auto pb-4 hide-scroll-mobile">
                        {lastOrder.items?.map((item, i) => (
                          <div key={i} className="flex-shrink-0 flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                            <img src={item.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                            <div>
                              <p className="text-xs font-bold line-clamp-1">{item.name}</p>
                              <p className="text-[10px] text-text-muted font-black">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleReorder(lastOrder)}
                      className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add All to Cart
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-white/10 mb-4" />
                    <p className="text-sm font-bold text-text-muted">No orders yet. Your favorites will appear here!</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ MARQUEE TICKER ═══ */}
      <div className="bg-primary py-3 md:py-6 overflow-hidden border-y border-white/10 relative z-20">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-white font-display text-2xl md:text-5xl tracking-widest mx-4 md:mx-8 flex items-center gap-4 md:gap-8">
              <Utensils className="w-5 h-5 md:w-8 md:h-8 opacity-50" /> SMASH BURGERS • <Zap className="w-5 h-5 md:w-8 md:h-8 opacity-50" /> CRISPY WRAPS • <Utensils className="w-5 h-5 md:w-8 md:h-8 opacity-50" /> LOADED FRIES • <Zap className="w-5 h-5 md:w-8 md:h-8 opacity-50" /> STONE-BAKED PIZZA •&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ═══ FEATURED SECTION ═══ */}
      <section className="py-32 container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="text-primary font-bold tracking-[0.3em] uppercase mb-4 block text-xs"
            >
              Curated Favorites
            </motion.span>
            <h2 className="text-5xl md:text-7xl font-display tracking-tight">LEGENDARY <span className="text-primary">EATS.</span></h2>
          </div>
          <Link to="/menu" className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-primary transition-all">
            Explore All Items <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary group-hover:bg-primary transition-all"><ArrowRight className="w-4 h-4" /></div>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            <SkeletonCard count={4} />
          </div>
        ) : (
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
          >
            {featuredItems.map(item => (
              <MenuCard key={item.id} item={item} onView={setSelectedItem} />
            ))}
          </motion.div>
        )}
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section ref={statsRef} className="py-24 bg-[#0a0a0a] border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-50" />
        <div className="container mx-auto px-4 relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { value: s1, suffix: '+', label: 'Menu Items', icon: Utensils },
            { value: s2, suffix: ' Min', label: 'Fast Delivery', icon: Clock },
            { value: s3, suffix: '+', label: 'Happy Orders', icon: ShoppingBag },
            { value: (s4 / 10).toFixed(1), suffix: '★', label: 'Avg Rating', icon: Star },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="text-center group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:scale-110 group-hover:bg-primary transition-all group-hover:text-white">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-4xl md:text-6xl font-display text-white mb-2 tracking-tighter">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-text-muted text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="py-32 bg-[#080808]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-display mb-4">CRAVING CATEGORIES</h2>
            <p className="text-text-muted max-w-lg mx-auto font-medium">Whatever you're in the mood for, we've got the perfect fix.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <Link
                to={`/menu?category=${cat.name}`}
                key={cat.id}
                className="glass-card hover:bg-primary/10 rounded-3xl p-8 flex flex-col items-center gap-4 transition-all hover:-translate-y-2 group border-white/5 hover:border-primary/50"
              >
                <span className="text-5xl group-hover:scale-125 transition-transform drop-shadow-xl">{cat.emoji}</span>
                <span className="font-display text-xl tracking-wider text-white">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REVIEWS PREVIEW ═══ */}
      {reviews.length > 0 && (
        <section className="py-32 container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-primary font-bold tracking-[0.3em] uppercase mb-4 block text-xs">Testimonials</span>
              <h2 className="text-5xl md:text-6xl font-display tracking-tight">VOICES OF <span className="text-primary">FLAVOR.</span></h2>
            </div>
            <Link to="/reviews" className="text-sm font-bold uppercase tracking-widest text-text-muted hover:text-white transition-all flex items-center gap-2">
              All Reviews <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map(review => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                key={review.id} 
                className="glass-card p-10 relative overflow-hidden border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="text-7xl text-primary/10 absolute -top-4 -left-2 font-display">"</div>
                <div className="relative z-10">
                  <div className="flex text-secondary mb-6 gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-current' : 'opacity-20'}`} />)}
                  </div>
                  <p className="text-white/90 text-lg leading-relaxed mb-8 font-medium italic">"{review.comment}"</p>
                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                      {review.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{review.userName}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Verified Foodie</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ ITEM DETAIL MODAL ═══ */}
      {selectedItem && (
        <Modal isOpen={!!selectedItem} onClose={() => { setSelectedItem(null); setItemQty(1); }}>
          <div className="max-w-xl mx-auto overflow-hidden rounded-[2.5rem]">
            <div className="h-56 sm:h-64 w-full relative">
              <img src={getOptimizedImageUrl(selectedItem.imageUrl, 800, 80)} alt={selectedItem.name} className="w-full h-full object-cover shadow-2xl" loading="lazy" />
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
