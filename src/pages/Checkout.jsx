import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import { ArrowRight, Info, MapPin, ShieldCheck, Lock, CreditCard, ChevronRight, User, Phone, Mail, Coins, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, LOYALTY_RATE } from '../constants/config';

export default function Checkout() {
  const { cartItems, cartTotal, cartSubtotal, deliveryFee, clearCart } = useCart();
  const { currentUser, userProfile, updateProfile, updateLoyaltyPoints } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [guestMode, setGuestMode] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [pointsDiscount, setPointsDiscount] = useState(0);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    street: '', city: 'Karachi', area: '',
    notes: '', saveAddress: false
  });
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !isSubmitting) navigate('/cart');
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
      }));
      const defaultAddr = userProfile.addresses?.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setFormData(prev => ({ ...prev, street: defaultAddr.street, area: defaultAddr.area, city: defaultAddr.city }));
      }
    }
  }, [cartItems, navigate, userProfile]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddressSelect = (addrId) => {
    setSelectedAddressId(addrId);
    if (addrId === 'new') {
      setFormData(prev => ({ ...prev, street: '', area: '', city: 'Karachi' }));
    } else {
      const addr = userProfile?.addresses?.find(a => a.id === addrId);
      if (addr) setFormData(prev => ({ ...prev, street: addr.street, area: addr.area, city: addr.city }));
    }
  };

  const handleTogglePoints = () => {
    if (!usePoints) {
      const maxDiscount = Math.min(userProfile?.loyaltyPoints || 0, cartSubtotal);
      setPointsDiscount(maxDiscount);
      setUsePoints(true);
      addToast(`Applied Rs. ${maxDiscount} discount!`, "success");
    } else {
      setPointsDiscount(0);
      setUsePoints(false);
    }
  };

  const finalTotal = cartTotal - pointsDiscount;
  const earnedPoints = Math.floor(finalTotal / 100) * LOYALTY_RATE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.street || !formData.area) {
      addToast("Please fill all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const orderId = `TFB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const fullAddress = `${formData.street}, ${formData.area}, ${formData.city}`;

      const orderData = {
        id: orderId,
        customerId: currentUser ? currentUser.uid : 'guest',
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: { street: formData.street, area: formData.area, city: formData.city, fullAddress },
        notes: formData.notes,
        items: cartItems.map(i => ({
          itemId: i.id, name: i.name, imageUrl: i.imageUrl,
          price: i.price, quantity: i.quantity,
          specialInstructions: i.specialInstructions || ''
        })),
        subtotal: cartSubtotal,
        deliveryFee,
        discount: pointsDiscount,
        total: finalTotal,
        status: 'pending',
        statusHistory: [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Order placed' }],
        paymentMethod: 'cod',
        estimatedDelivery: '30-45 minutes',
        emailSent: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', orderId), orderData);

      if (currentUser && userProfile) {
        // Award new points and deduct used ones
        const pointBalanceChange = earnedPoints - pointsDiscount;
        await updateLoyaltyPoints(pointBalanceChange);

        try {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            totalOrders: increment(1),
            totalSpent: increment(finalTotal),
            lastOrderAt: serverTimestamp()
          });
        } catch { }

        if (formData.saveAddress && selectedAddressId === 'new') {
          const newAddr = {
            id: `addr_${Date.now()}`,
            label: 'Home',
            street: formData.street,
            area: formData.area,
            city: formData.city,
            isDefault: false
          };
          await updateProfile({ addresses: [...(userProfile.addresses || []), newAddr] });
        }
      }

      try {
        const orderItemsHtml = cartItems.map(i => `${i.name} x${i.quantity} — Rs. ${(i.price * i.quantity).toLocaleString()}`).join('\n');
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_name: formData.name,
          to_email: formData.email,
          order_id: orderId,
          order_items_html: orderItemsHtml,
          subtotal: cartSubtotal.toLocaleString(),
          delivery_fee: deliveryFee.toString(),
          order_total: finalTotal.toLocaleString(),
          delivery_address: fullAddress,
          order_notes: formData.notes || 'None',
          estimated_time: '30–45 minutes',
          loyalty_points: earnedPoints.toString()
        }, EMAILJS_PUBLIC_KEY);
      } catch { }

      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      addToast("Failed to place order. Please try again.", "error");
      setIsSubmitting(false);
    }
  };

  if (!currentUser && !guestMode) {
    return (
      <div className="pt-32 pb-24 min-h-[90vh] flex flex-col items-center justify-center container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 max-w-lg w-full text-center relative overflow-hidden border-white/5"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/20">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-4xl font-display mb-4 uppercase tracking-tighter">SECURE <span className="text-primary">ACCESS</span></h2>
          <p className="text-text-muted mb-10 text-lg font-medium leading-relaxed px-4">Login to your account to earn loyalty points and access your saved delivery addresses.</p>
          
          <div className="space-y-4">
            <Link to="/login?redirect=/checkout" className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-2xl font-bold tracking-[0.2em] uppercase text-xs shadow-xl shadow-primary/20 hover:opacity-90 transition-all">
              Login to Continue <ChevronRight className="w-4 h-4" />
            </Link>
            
            <div className="relative flex items-center py-6">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink-0 mx-6 text-text-muted text-[10px] font-bold uppercase tracking-[0.3em]">OR</span>
              <div className="flex-grow border-t border-white/10" />
            </div>
            
            <button 
              onClick={() => setGuestMode(true)} 
              className="w-full py-5 border border-white/10 text-white rounded-2xl font-bold tracking-[0.2em] uppercase text-xs hover:bg-white/5 transition-all"
            >
              Express Checkout as Guest
            </button>
          </div>
        </motion.div>
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
            Final Step
          </motion.span>
          <h1 className="text-5xl md:text-7xl font-display tracking-tight uppercase">SECURE <span className="text-primary">CHECKOUT</span></h1>
        </div>
        <p className="text-text-muted font-bold uppercase tracking-widest text-sm mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-success" /> SSL Encrypted
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-16">
        <div className="lg:col-span-3 space-y-12">
          {/* Contact Details */}
          <div className="glass-card p-10 border-white/5">
            <h3 className="text-2xl font-display mb-8 flex items-center gap-4 uppercase tracking-widest text-white">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><User className="w-5 h-5" /></div>
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Full Name *</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field pl-12" placeholder="Muhammad Ali" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Phone Number *</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field pl-12" placeholder="0300 1234567" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address *</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input-field pl-12" placeholder="you@example.com" />
                </div>
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="glass-card p-10 border-white/5">
            <h3 className="text-2xl font-display mb-8 flex items-center gap-4 uppercase tracking-widest text-white">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><MapPin className="w-5 h-5" /></div>
              Delivery Logistics
            </h3>

            {currentUser && userProfile?.addresses?.length > 0 && (
              <div className="mb-8">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 block mb-3">Choose Destination</label>
                <div className="flex flex-wrap gap-3">
                  {userProfile.addresses.map(addr => (
                    <button key={addr.id} type="button" onClick={() => handleAddressSelect(addr.id)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        selectedAddressId === addr.id 
                        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' 
                        : 'border-white/5 text-text-muted hover:border-white/20'
                      }`}>
                      {addr.label}
                    </button>
                  ))}
                  <button type="button" onClick={() => handleAddressSelect('new')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      selectedAddressId === 'new' 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-white/5 text-text-muted hover:border-white/20'
                    }`}>
                    + New Location
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Street Address *</label>
                <input required type="text" name="street" value={formData.street} onChange={handleChange} className="input-field" placeholder="House 123, Street 4, Block 5" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Area / Landmark *</label>
                <input required type="text" name="area" value={formData.area} onChange={handleChange} className="input-field" placeholder="DHA Phase 6" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">City</label>
                <input type="text" name="city" value={formData.city} readOnly className="input-field bg-white/5 opacity-50 cursor-not-allowed" />
              </div>
              
              <div className="md:col-span-2 pt-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1 block mb-3">Special Instructions (Optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" className="input-field resize-none" placeholder="Landmarks, apartment codes, extra spices, etc..." />
              </div>

              {currentUser && selectedAddressId === 'new' && (
                <div className="md:col-span-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={formData.saveAddress} onChange={e => setFormData({ ...formData, saveAddress: e.target.checked })} className="accent-primary w-5 h-5" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest group-hover:text-white transition-colors">Save this location to my profile</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="glass-card p-10 border-white/5">
            <h3 className="text-2xl font-display mb-8 flex items-center gap-4 uppercase tracking-widest text-white">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20"><CreditCard className="w-5 h-5" /></div>
              Payment Method
            </h3>
            <div className="relative overflow-hidden group border border-primary/40 bg-primary/5 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">💵</div>
                <div>
                  <h4 className="font-bold text-lg text-white uppercase tracking-tight">Cash on Delivery</h4>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Pay Rs. {finalTotal.toLocaleString()} at your doorstep</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border-[8px] border-primary flex items-center justify-center shadow-lg shadow-primary/20" />
            </div>

            {/* Loyalty Redemption UI */}
            {currentUser && (userProfile?.loyaltyPoints > 0 || usePoints) && (
              <div className={`mt-6 p-6 rounded-2xl border transition-all ${usePoints ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${usePoints ? 'bg-primary text-white' : 'bg-white/10 text-primary'}`}>
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase">Loyalty Points</h4>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                        {usePoints ? `Redeemed ${pointsDiscount} Points` : `You have ${userProfile?.loyaltyPoints || 0} Points`}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleTogglePoints}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      usePoints ? 'bg-white text-primary' : 'bg-primary text-white'
                    }`}
                  >
                    {usePoints ? 'Remove' : 'Redeem Now'}
                  </button>
                </div>
                {usePoints && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-[10px] text-primary font-bold uppercase tracking-widest mt-4 pt-4 border-t border-primary/20">
                    🎉 Awesome! You've saved Rs. {pointsDiscount} on this order.
                  </motion.p>
                )}
              </div>
            )}
            <div className="flex items-center gap-3 mt-6 text-[10px] text-text-muted font-bold uppercase tracking-widest bg-white/5 p-4 rounded-xl border border-white/5">
              <ShieldCheck className="w-4 h-4 text-success" />
              Your transaction is protected by end-to-end security protocols.
            </div>
          </div>
        </div>

        {/* Order Bill Summary */}
        <div className="lg:col-span-2">
          <div className="glass-card p-10 sticky top-28 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <h3 className="text-2xl font-display mb-10 uppercase tracking-widest text-white border-b border-white/5 pb-6">Final Bill</h3>
            
            <div className="space-y-4 mb-10 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <span className="font-display text-primary text-lg">x{item.quantity}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white uppercase truncate">{item.name}</p>
                      <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Rs. {item.price} each</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-10 border-t border-white/5 pt-8">
              <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <span>Subtotal</span>
                <span className="text-white">Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                <span>Express Delivery</span>
                <span className="text-white">Rs. {deliveryFee}</span>
              </div>
              {usePoints && (
                <div className="flex justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
                  <span>Loyalty Discount</span>
                  <span>- Rs. {pointsDiscount}</span>
                </div>
              )}
              <div className="pt-8 mt-6 border-t border-white/5 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Grand Total</span>
                  <span className="text-[9px] text-success font-bold uppercase tracking-widest">COD Payment</span>
                </div>
                <span className="text-4xl font-display text-primary tracking-tighter">Rs. {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              <div className="flex items-center gap-4 bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <Coins className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-0.5">Loyalty Earnings</p>
                  <p className="text-xs font-bold text-white">+{earnedPoints} Points Reward</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 border border-white/5 rounded-xl bg-white/[0.02]">
                <Clock className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">ETA: 30–45 Minutes</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-primary text-white rounded-2xl font-bold tracking-[0.2em] uppercase text-xs shadow-2xl shadow-primary/30 hover:opacity-90 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                <>Place Order <ArrowRight className="w-5 h-5" /></>
              )}
            </motion.button>
            
            <p className="text-center text-[9px] text-text-muted mt-6 font-bold uppercase tracking-widest opacity-40">
              By placing order, you agree to our terms of service.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
