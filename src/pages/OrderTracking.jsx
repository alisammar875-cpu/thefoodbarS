import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Package, ChefHat, Truck, Home, CheckCircle, XCircle, MapPin, Clock } from 'lucide-react';
import { STATUS_LABELS } from '../constants/config';

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Being Prepared', icon: ChefHat },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState(null);
  const [searchId, setSearchId] = useState('');

  // Find order by custom id then subscribe to real-time updates
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let unsub;
    const findOrder = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'orders'), where('id', '==', id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          setDocId(d.id);
          setOrder(d.data());

          // Subscribe to real-time updates
          const { doc: fbDoc } = await import('firebase/firestore');
          unsub = onSnapshot(fbDoc(db, 'orders', d.id), (docSnap) => {
            if (docSnap.exists()) setOrder(docSnap.data());
          });
        } else {
          setOrder(null);
        }
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    findOrder();

    return () => { if (unsub) unsub(); };
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!id || !order) {
    return (
      <div className="pt-32 pb-24 min-h-screen container mx-auto px-4 flex flex-col items-center justify-center max-w-lg text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 w-full border-white/5">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <Package className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-display mb-2 uppercase tracking-tighter">TRACK YOUR <span className="text-primary">MEAL</span></h2>
          <p className="text-text-muted mb-8 text-sm">Enter your Order ID to see live progress.</p>
          
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. TFB-123456" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="input-field text-center font-mono tracking-widest"
            />
            <Link 
              to={searchId ? `/track/${searchId.trim().toUpperCase()}` : '#'}
              className={`w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-xl font-bold tracking-widest uppercase text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all ${!searchId && 'opacity-50 pointer-events-none'}`}
            >
              Track Progress
            </Link>
          </div>
          {!order && id && (
            <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest mt-6 bg-red-400/10 py-2 rounded-lg border border-red-400/20">
              Order ID "{id}" not found. Please check and try again.
            </p>
          )}
        </motion.div>
        <Link to="/menu" className="mt-8 text-text-muted hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Back to Menu</Link>
      </div>
    );
  }

  const currentStatus = order.status?.toLowerCase().replace(/ /g, '_') || 'pending';
  const isCancelled = currentStatus === 'cancelled';
  const isDelivered = currentStatus === 'delivered';
  const currentStepIndex = STEPS.findIndex(s => s.key === currentStatus);

  return (
    <div className="pt-32 pb-24 min-h-screen container mx-auto px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-display">TRACK <span className="text-primary">ORDER</span></h1>
          <p className="text-text-muted font-mono text-sm mt-1">{id}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-500 font-bold uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Progress Stepper */}
      {!isCancelled ? (
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Connection line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/10 z-0" />
            <div className="absolute top-6 left-6 h-0.5 bg-primary z-0 transition-all duration-1000"
              style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (STEPS.length - 1)) * (100 - 8) : 0}%` }} />

            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isComplete = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center text-center" style={{ flex: 1 }}>
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      isComplete ? 'bg-primary border-primary text-white' : 'bg-[#141414] border-white/20 text-text-muted'
                    }`}
                    animate={isCurrent ? { boxShadow: ['0 0 0 0 rgba(255,58,31,0.4)', '0 0 0 12px rgba(255,58,31,0)', '0 0 0 0 rgba(255,58,31,0.4)'] } : {}}
                    transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  <span className={`text-xs mt-2 font-medium ${isComplete ? 'text-white' : 'text-text-muted'} hidden sm:block`}>{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Status message */}
          <div className="mt-8 text-center">
            {currentStatus === 'preparing' && (
              <p className="text-lg">🍳 Your food is being prepared fresh!</p>
            )}
            {currentStatus === 'out_for_delivery' && (
              <div>
                <p className="text-lg mb-2">🛵 On the way!</p>
                <motion.div animate={{ x: [-20, 20, -20] }} transition={{ duration: 3, repeat: Infinity }} className="text-4xl">🛵</motion.div>
              </div>
            )}
            {isDelivered && (
              <p className="text-lg text-green-400">🎉 Delivered! Enjoy your meal!</p>
            )}
            {currentStatus === 'pending' && (
              <p className="text-text-muted">Waiting for restaurant confirmation...</p>
            )}
            {currentStatus === 'confirmed' && (
              <p className="text-text-muted">Your order is confirmed and will be prepared soon.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 mb-8 text-center border-red-500/20">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-display text-red-400">ORDER CANCELLED</h3>
          <p className="text-text-muted mt-2">This order has been cancelled.</p>
        </div>
      )}

      {/* Estimated Time */}
      {!isCancelled && !isDelivered && (
        <div className="glass-card p-6 mb-8 flex items-center gap-4">
          <Clock className="w-8 h-8 text-secondary shrink-0" />
          <div>
            <p className="font-bold">Estimated Delivery</p>
            <p className="text-text-muted text-sm">30–45 minutes from confirmation</p>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display text-lg mb-4 border-b border-white/10 pb-2">ITEMS ORDERED</h3>
          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-black/20 p-3 rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/50 shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{item.name}</p>
                  <p className="text-xs text-text-muted">{item.quantity}x @ PKR {item.price}</p>
                </div>
                <span className="text-sm font-bold shrink-0">PKR {item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm">
            <div className="flex justify-between text-text-muted"><span>Subtotal</span><span>PKR {order.subtotal}</span></div>
            <div className="flex justify-between text-text-muted"><span>Delivery</span><span>PKR {order.deliveryFee}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-white/5"><span>Total</span><span className="text-primary">PKR {order.total}</span></div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-lg mb-4 border-b border-white/10 pb-2">DELIVERY INFO</h3>
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-text-muted block text-xs uppercase tracking-widest mb-1">Customer</span>
              <p className="font-bold">{order.customerName}</p>
              <p className="text-text-muted">{order.customerPhone}</p>
            </div>
            <div>
              <span className="text-text-muted block text-xs uppercase tracking-widest mb-1">Address</span>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p>{typeof order.address === 'string' ? order.address : order.address?.fullAddress || `${order.address?.street}, ${order.address?.area}, ${order.address?.city}`}</p>
              </div>
            </div>
            {order.notes && (
              <div>
                <span className="text-text-muted block text-xs uppercase tracking-widest mb-1">Notes</span>
                <p className="text-text-muted italic">{order.notes}</p>
              </div>
            )}
            <div>
              <span className="text-text-muted block text-xs uppercase tracking-widest mb-1">Payment</span>
              <p>💵 Cash on Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback prompt on delivery */}
      {isDelivered && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mt-8 text-center">
          <h3 className="text-2xl font-display mb-2">HOW WAS YOUR ORDER?</h3>
          <p className="text-text-muted mb-6">Your feedback helps us improve!</p>
          <Link to="/reviews" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
            Leave a Review
          </Link>
        </motion.div>
      )}
    </div>
  );
}
