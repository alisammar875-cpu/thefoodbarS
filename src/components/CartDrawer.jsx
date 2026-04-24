import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Coins, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useConfig } from '../contexts/ConfigContext';
import { useNavigate, Link } from 'react-router-dom';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeItem, cartSubtotal, deliveryFee, cartTotal, cartCount } = useCart();
  const { config } = useConfig();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#080808] z-[101] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] border-l border-white/5"
          >
            <div className="flex justify-between items-center p-8 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-display tracking-widest text-white uppercase">Your Order</h2>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{cartCount} items selected</p>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-text-muted hover:text-white transition-all p-2 bg-white/5 rounded-xl hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6"
                  >
                    <ShoppingBag className="w-10 h-10 text-white/10" />
                  </motion.div>
                  <h3 className="text-xl font-display tracking-wider mb-2">CART IS EMPTY</h3>
                  <p className="text-sm text-text-muted mb-8 leading-relaxed">Looks like you haven't added anything to your cart yet. Browse our menu to find something delicious.</p>
                  <button
                    onClick={() => { setIsCartOpen(false); navigate('/menu'); }}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold tracking-widest uppercase text-xs shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    Explore Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item, idx) => (
                      <motion.div
                        layout
                        key={`${item.id}-${item.specialInstructions}-${idx}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="group flex gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/50 shrink-0 border border-white/10 relative">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-white leading-tight truncate uppercase tracking-wide">{item.name}</h4>
                              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Rs. {item.price}</p>
                              {item.specialInstructions && (
                                <p className="text-[10px] text-text-muted mt-1 italic line-clamp-1 opacity-60">"{item.specialInstructions}"</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeItem(item.id, item.specialInstructions)}
                              className="text-text-muted hover:text-primary transition-all p-1.5 hover:bg-primary/10 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex items-center gap-4 bg-black/40 rounded-xl px-3 py-1.5 border border-white/5">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.specialInstructions)} className="text-text-muted hover:text-white transition-colors">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-sm font-display w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.specialInstructions)} className="text-text-muted hover:text-white transition-colors">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-white font-display text-base">Rs. {item.price * item.quantity}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-8 border-t border-white/10 bg-[#0A0A0A] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-text-muted text-[10px] font-bold uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-white">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-text-muted text-[10px] font-bold uppercase tracking-widest">
                    <span>Delivery Fee</span>
                    <span className="text-white">Rs. {deliveryFee}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Total</span>
                    <span className="text-primary font-display text-3xl tracking-tighter">Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Loyalty Points</p>
                      <p className="text-xs font-bold text-white">Earn +{Math.floor(cartSubtotal/10)} Points</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-primary/20" />
                  <p className="text-[10px] font-medium text-text-muted italic">Redeem later for discounts</p>
                </div>

                <div className="flex gap-4">
                  <Link to="/cart" onClick={() => setIsCartOpen(false)}
                    className="flex-1 py-4 text-center border border-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all">
                    Full Cart
                  </Link>
                  <motion.button
                    whileTap={config.isAcceptingOrders ? { scale: 0.98 } : {}}
                    disabled={!config.isAcceptingOrders}
                    onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
                    className={`flex-[2] py-4 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] ${
                      config.isAcceptingOrders 
                      ? 'bg-primary text-white shadow-primary/20 hover:opacity-90' 
                      : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5 shadow-none'
                    }`}
                  >
                    {config.isAcceptingOrders ? (
                      <>Proceed <ArrowRight className="w-4 h-4" /></>
                    ) : (
                      'Store Closed'
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
