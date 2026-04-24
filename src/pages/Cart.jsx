import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShoppingBag, Coins, ShieldCheck } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeItem, cartSubtotal, deliveryFee, cartTotal, cartCount, addToCart } = useCart();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = React.useState([]);

  // AI-Style Recommendation Logic
  React.useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const itemsRef = collection(db, 'menu_items');
        const q = query(itemsRef, limit(20));
        const snap = await getDocs(q);
        const allItems = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Filter out items already in cart
        const cartIds = new Set(cartItems.map(i => i.id));
        const available = allItems.filter(i => !cartIds.has(i.id));

        // Smart logic: if cart has main items (Burgers/Pizza), prioritize Drinks/Sides
        const hasMain = cartItems.some(i => ['Burgers', 'Pizza', 'Wraps'].includes(i.category));
        
        const recs = available
          .sort(() => Math.random() - 0.5)
          .filter(i => {
            if (hasMain) return i.category === 'Drinks' || i.category === 'Fries & Sides';
            return true;
          })
          .slice(0, 3);
        
        setRecommendations(recs);
      } catch (e) { console.error(e); }
    };
    if (cartItems.length > 0) fetchRecommendations();
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="pt-32 pb-24 min-h-[90vh] flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8"
        >
          <ShoppingBag className="w-14 h-14 text-white/10" />
        </motion.div>
        <h2 className="text-5xl md:text-7xl font-display mb-4 uppercase tracking-tighter">YOUR CART IS <span className="text-primary">EMPTY</span></h2>
        <p className="text-text-muted mb-12 max-w-md text-lg font-medium">Looks like you haven't added anything to your cart yet. Explore our legendary menu to find something you'll love!</p>
        <Link to="/menu" className="relative group px-12 py-5 bg-primary text-white rounded-2xl font-bold tracking-[0.2em] uppercase text-sm shadow-2xl shadow-primary/30 active:scale-95 transition-all overflow-hidden flex items-center justify-center gap-3">
          <span className="relative z-10">Return to Menu</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 min-h-screen container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <motion.span 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="text-primary font-bold tracking-[0.4em] uppercase text-[10px] mb-4 block"
          >
            Review Your Order
          </motion.span>
          <h1 className="text-5xl md:text-7xl font-display tracking-tight uppercase">SHOPPING <span className="text-primary">CART</span></h1>
        </div>
        <p className="text-text-muted font-bold uppercase tracking-widest text-sm mb-2">{cartCount} Items Selected</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-16 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="popLayout">
            {cartItems.map((item, idx) => (
              <motion.div
                key={`${item.id}-${item.specialInstructions}-${idx}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="glass-card p-4 flex flex-row gap-4 items-center group hover:border-primary/20 transition-all border-white/5"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-white/10">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm uppercase tracking-tight text-white truncate">{item.name}</h4>
                      {item.specialInstructions && (
                        <p className="text-[10px] text-text-muted italic opacity-60 truncate">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.specialInstructions)} 
                      className="text-text-muted hover:text-primary transition-all p-1.5 hover:bg-primary/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-4 bg-black/40 rounded-lg px-2 py-1 border border-white/5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.specialInstructions)} className="text-text-muted hover:text-white transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-display w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.specialInstructions)} className="text-text-muted hover:text-white transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <span className="font-display text-lg text-white">Rs. {item.price * item.quantity}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          </AnimatePresence>

          {/* Recommendations - AI Cross-sell */}
          {recommendations.length > 0 && (
            <div className="mt-12">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                <span className="w-8 h-px bg-primary/30" /> Pairs Well With
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map(rec => (
                  <div key={rec.id} className="glass-card p-3 flex gap-4 items-center group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/5">
                      <img src={rec.imageUrl} alt={rec.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[10px] font-bold text-white uppercase truncate">{rec.name}</h5>
                      <p className="text-[10px] text-primary font-bold mt-0.5">Rs. {rec.price}</p>
                    </div>
                    <button 
                      onClick={() => addToCart(rec)}
                      className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link to="/menu" className="inline-flex items-center gap-3 text-text-muted hover:text-primary transition-all text-[10px] font-bold uppercase tracking-[0.2em] group mt-12">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-2">
          <div className="glass-card p-10 sticky top-28 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            
            <h3 className="text-2xl font-display mb-8 uppercase tracking-widest text-white">Order Summary</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <span>Cart Subtotal</span>
                <span className="text-white">Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <span>Express Delivery</span>
                <span className="text-white">Rs. {deliveryFee}</span>
              </div>
              <div className="pt-6 mt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-sm font-bold text-white uppercase tracking-[0.2em]">Total Amount</span>
                <span className="text-4xl font-display text-primary tracking-tighter">Rs. {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Loyalty Points Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Loyalty Reward</p>
                  <p className="text-sm font-bold text-white">+{Math.floor(cartSubtotal/10)} Points</p>
                </div>
              </div>
              <div className="h-10 w-px bg-primary/20" />
              <p className="text-[9px] text-text-muted italic max-w-[80px] leading-tight">Redeem for discounts later</p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-success shrink-0" />
                <p className="text-[10px] text-text-muted leading-relaxed font-bold uppercase tracking-tight">Secure Checkout · Cash on Delivery · Express Logistics</p>
              </div>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest text-center animate-pulse">
                Order now for delivery by {new Date(Date.now() + 45*60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/checkout')}
              className="w-full py-5 bg-primary text-white rounded-2xl font-bold tracking-[0.2em] uppercase text-xs shadow-2xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center gap-3"
            >
              Confirm & Checkout <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest text-center opacity-40">
                Guaranteed satisfaction with every bite.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
