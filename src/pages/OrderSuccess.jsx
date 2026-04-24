import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF8A25', '#FFC107', '#FF6B35', '#ffffff']
    });

    const fetchOrder = async () => {
      try {
        // Try to find order by custom id field
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        }
      } catch (error) {
        // silent
      }
      setLoading(false);
    };
    fetchOrder();
  }, [id]);

  const loyaltyPoints = order ? Math.floor(order.total / 100) * 10 : 0;

  return (
    <div className="pt-32 pb-24 min-h-screen container mx-auto px-4 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', delay: 0.3 }}
        className="text-center">

        {/* Animated Checkmark */}
        <div className="mx-auto w-24 h-24 mb-8 relative">
          <motion.svg viewBox="0 0 100 100" className="w-full h-full" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
            <circle cx="50" cy="50" r="46" fill="none" stroke="#22C55E" strokeWidth="4" />
            <motion.path
              d="M30 52 L44 66 L70 38"
              fill="none"
              stroke="#22C55E"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            />
          </motion.svg>
        </div>

        <motion.h1 className="text-5xl md:text-6xl font-display mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          ORDER <span className="text-primary">PLACED!</span>
        </motion.h1>

        <p className="text-text-muted text-lg mb-6">We've received your order and are waiting for the restaurant to confirm it. Hang tight!</p>

        {/* Order ID */}
        <div className="inline-block glass-card px-8 py-4 mb-8">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-1">Order ID</p>
          <p className="text-2xl font-display font-bold text-primary tracking-wider">{id}</p>
        </div>

        {/* Loyalty Points */}
        {userProfile && loyaltyPoints > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
            className="glass-card p-4 mb-8 inline-flex items-center gap-3 mx-auto">
            <Trophy className="w-6 h-6 text-secondary" />
            <span className="text-sm">You earned <strong className="text-secondary">{loyaltyPoints} loyalty points</strong> on this order!</span>
          </motion.div>
        )}

        {/* Order Summary */}
        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="glass-card p-6 text-left mb-8">
            <h3 className="font-display text-lg mb-4 border-b border-white/10 pb-2">ORDER SUMMARY</h3>
            <div className="space-y-3 mb-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span className="text-text-muted">PKR {item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-text-muted"><span>Delivery Fee</span><span>PKR {order.deliveryFee}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">PKR {order.total}</span></div>
            </div>
            {order.address && (
              <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-2 text-sm text-text-muted">
                <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{typeof order.address === 'string' ? order.address : order.address.fullAddress}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={`/track/${id}`} className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl font-bold tracking-wide hover:opacity-90 transition-all flex items-center justify-center gap-2">
            📍 Track My Order
          </Link>
          <Link to="/menu" className="border border-white/20 text-white px-8 py-4 rounded-xl font-bold tracking-wide hover:bg-white/5 transition-all flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
