import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShoppingBag, Coins, ShieldCheck } from 'lucide-react';

export default function Cart() {
  const { cartItems, updateQuantity, removeItem, cartSubtotal, deliveryFee, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

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
                className="glass-card p-6 flex flex-col sm:flex-row gap-6 items-center group hover:border-primary/20 transition-all border-white/5"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black/50 shrink-0 border border-white/10">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>
                
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2">
                    <div>
                      <h4 className="font-bold text-lg uppercase tracking-tight text-white mb-1">{item.name}</h4>
                      {item.specialInstructions && (
                        <p className="text-xs text-text-muted italic opacity-60">Note: {item.specialInstructions}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.specialInstructions)} 
                      className="text-text-muted hover:text-primary transition-all p-2 hover:bg-primary/10 rounded-xl sm:-mt-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 mt-6">
                    <div className="flex items-center gap-6 bg-black/40 rounded-xl px-4 py-2 border border-white/5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.specialInstructions)} className="text-text-muted hover:text-white transition-colors">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-lg font-display w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.specialInstructions)} className="text-text-muted hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-text-muted font-bold text-xs uppercase tracking-widest">
                      <span className="text-white">Rs. {item.price}</span> / item
                    </div>

                    <div className="ml-auto sm:block hidden">
                      <span className="font-display text-2xl text-white">Rs. {item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link to="/menu" className="inline-flex items-center gap-3 text-text-muted hover:text-primary transition-all text-sm font-bold uppercase tracking-[0.2em] group mt-8">
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
