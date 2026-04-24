import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Filter, ChevronDown } from 'lucide-react';
import StarRating from '../components/StarRating';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showForm, setShowForm] = useState(false);

  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();

  // Review form
  const [reviewForm, setReviewForm] = useState({ itemId: '', itemName: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const revQuery = query(collection(db, 'reviews'), where('isApproved', '==', true));
        const revSnap = await getDocs(revQuery);
        setReviews(revSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const itemSnap = await getDocs(collection(db, 'menu_items'));
        setMenuItems(itemSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSubmitReview = async () => {
    if (!reviewForm.itemId || !reviewForm.comment) return addToast('Please select an item and write a comment.', 'error');
    setSubmitting(true);
    try {
      const item = menuItems.find(m => m.id === reviewForm.itemId);
      await addDoc(collection(db, 'reviews'), {
        userId: currentUser.uid,
        userName: userProfile?.name || 'Customer',
        userEmail: currentUser.email,
        itemId: reviewForm.itemId,
        itemName: item?.name || reviewForm.itemName,
        orderId: '',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        isApproved: false,
        isHighlighted: false,
        adminReply: null,
        createdAt: serverTimestamp()
      });
      addToast('Review submitted! It will appear after approval.', 'success');
      setShowForm(false);
      setReviewForm({ itemId: '', itemName: '', rating: 5, comment: '' });
    } catch (error) {
      addToast('Failed to submit review.', 'error');
    }
    setSubmitting(false);
  };

  // Compute stats
  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const ratingBreakdown = [5, 4, 3, 2, 1].map(r => ({
    stars: r,
    count: reviews.filter(rev => rev.rating === r).length,
    percentage: reviews.length > 0 ? (reviews.filter(rev => rev.rating === r).length / reviews.length) * 100 : 0
  }));

  // Filter and sort
  let filtered = filterRating > 0 ? reviews.filter(r => r.rating === filterRating) : reviews;
  if (sortBy === 'highest') filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  else if (sortBy === 'lowest') filtered = [...filtered].sort((a, b) => a.rating - b.rating);
  else filtered = [...filtered].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  return (
    <div className="pt-28 pb-24 min-h-screen container mx-auto px-4">
      <h1 className="text-4xl md:text-5xl font-display mb-4">CUSTOMER <span className="text-primary">REVIEWS</span></h1>
      <p className="text-text-muted mb-12 max-w-xl">See what our customers are saying about The Food Bar.</p>

      {/* Summary Bar */}
      <div className="glass-card p-8 mb-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-display text-primary">{avgRating.toFixed(1)}</div>
              <StarRating rating={avgRating} size="md" />
              <p className="text-sm text-text-muted mt-1">{reviews.length} total reviews</p>
            </div>
          </div>
          <div className="space-y-2">
            {ratingBreakdown.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="text-sm font-bold w-8">{stars}★</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${percentage}%` }} />
                </div>
                <span className="text-xs text-text-muted w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters + Write Review */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-2 flex-wrap items-center">
          <Filter className="w-4 h-4 text-text-muted" />
          {[0, 5, 4, 3, 2, 1].map(r => (
            <button key={r} onClick={() => setFilterRating(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterRating === r ? 'bg-primary text-white border-primary' : 'border-white/10 text-text-muted hover:border-white/30'}`}>
              {r === 0 ? 'All' : `${r}★`}
            </button>
          ))}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-muted focus:outline-none">
            <option value="newest">Newest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {currentUser && (
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary/90">
            <MessageSquare className="w-4 h-4" /> Write a Review
          </motion.button>
        )}
      </div>

      {/* Write Review Form */}
      {showForm && currentUser && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-8">
          <h3 className="font-display text-xl mb-6">SHARE YOUR EXPERIENCE</h3>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm text-text-muted mb-1">Select Item *</label>
              <select value={reviewForm.itemId} onChange={e => setReviewForm({ ...reviewForm, itemId: e.target.value })} className="input-field">
                <option value="">Choose an item...</option>
                {menuItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2">Rating *</label>
              <StarRating rating={reviewForm.rating} onChange={r => setReviewForm({ ...reviewForm, rating: r })} size="lg" />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Comment *</label>
              <textarea rows="4" value={reviewForm.comment} onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })} className="input-field resize-none" placeholder="How was the food and experience?" />
            </div>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleSubmitReview} disabled={submitting}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold disabled:opacity-70">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </motion.button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      {!currentUser && (
        <div className="glass-card p-6 mb-8 text-center">
          <p className="text-text-muted"><a href="/login" className="text-primary font-bold hover:underline">Login</a> to write a review.</p>
        </div>
      )}

      {/* Review List */}
      {loading ? (
        <div className="text-center py-16 text-text-muted">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-2xl font-display mb-2">NO REVIEWS YET</h3>
          <p className="text-text-muted">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass-card p-6 hover:border-white/20 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {review.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-sm">{review.userName}</h4>
                    <span className="text-xs text-text-muted">{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : ''}</span>
                  </div>
                  <p className="text-xs text-text-muted mb-2">ordered {review.itemName}</p>
                  <StarRating rating={review.rating} size="sm" />
                  <p className="text-sm text-white/80 mt-3 leading-relaxed">{review.comment}</p>
                  {review.adminReply && (
                    <div className="mt-4 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg py-2 pr-3">
                      <p className="text-sm italic text-white/70">{review.adminReply}</p>
                      <p className="text-xs text-primary mt-1 font-bold">— The Food Bar</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
