import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import { Star, CheckCircle, XCircle, Trash2, Search, MessageCircle, Heart, Filter, User, ShoppingBag } from 'lucide-react';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleToggle = async (id, field, currentValue) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { [field]: !currentValue });
      addToast(`Updated ${field}`, "success");
    } catch (error) {
      addToast("Failed to update", "error");
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this review permanently?")) return;
    try {
      await deleteDoc(doc(db, 'reviews', id));
      addToast("Review deleted", "success");
    } catch (error) {
      addToast("Failed to delete", "error");
    }
  };

  const handleReply = async () => {
    if (!replyModal) return;
    try {
      await updateDoc(doc(db, 'reviews', replyModal.id), { 
        adminReply: replyText,
        repliedAt: new Date().toISOString()
      });
      addToast("Reply sent", "success");
      setReplyModal(null);
      setReplyText('');
    } catch (error) {
      addToast("Failed to send reply", "error");
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch = r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || 
                         (filter === 'Pending' && !r.isApproved) || 
                         (filter === 'Approved' && r.isApproved) ||
                         (filter === 'Highlighted' && r.isHighlighted);
    return matchesSearch && matchesFilter;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-wider uppercase">REVIEWS <span className="text-primary">MODERATION</span></h1>
          <p className="text-text-muted">Monitor and engage with customer feedback.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-4 py-2 flex flex-col items-center">
            <span className="text-[10px] font-bold text-text-muted uppercase">Avg Rating</span>
            <span className="text-xl font-display text-secondary flex items-center gap-1">{avgRating} <Star className="w-4 h-4 fill-current" /></span>
          </div>
          <div className="glass-card px-4 py-2 flex flex-col items-center">
            <span className="text-[10px] font-bold text-text-muted uppercase">Pending</span>
            <span className="text-xl font-display text-primary">{reviews.filter(r => !r.isApproved).length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by customer, item or comment..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="lg:col-span-2 overflow-x-auto hide-scroll-mobile">
          <div className="flex gap-2 min-w-max">
            {['All', 'Pending', 'Approved', 'Highlighted'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full py-24 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filteredReviews.length === 0 ? (
            <div className="col-span-full py-24 text-center text-text-muted glass-card border-dashed border-white/10">No reviews found matching the filters.</div>
          ) : (
            filteredReviews.map(review => (
              <motion.div 
                key={review.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`glass-card p-6 flex flex-col justify-between group transition-all hover:border-primary/20 ${!review.isApproved ? 'border-primary/20 bg-primary/5' : 'border-white/5'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-primary border border-white/10">
                        {review.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight">{review.userName}</h4>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggle(review.id, 'isHighlighted', review.isHighlighted)}
                        className={`p-2 rounded-lg transition-all ${review.isHighlighted ? 'text-secondary bg-secondary/10' : 'text-text-muted hover:bg-white/5'}`}
                        title="Highlight on Home Page"
                      >
                        <Heart className={`w-4 h-4 ${review.isHighlighted ? 'fill-current' : ''}`} />
                      </button>
                      <span className={`text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest ${review.isApproved ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3 bg-white/5 p-2 rounded-lg border border-white/5">
                    <ShoppingBag className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest truncate">{review.itemName}</span>
                  </div>

                  <div className="flex text-secondary mb-3 gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-current' : 'opacity-20'}`} />)}
                  </div>
                  
                  <p className="text-sm text-white/80 italic leading-relaxed mb-6 line-clamp-4">"{review.comment}"</p>

                  {review.adminReply && (
                    <div className="mb-6 p-3 bg-success/5 border-l-2 border-success/30 rounded-r-xl">
                      <p className="text-[10px] font-bold text-success uppercase tracking-widest mb-1 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> Admin Reply:
                      </p>
                      <p className="text-xs text-white/70 italic leading-relaxed">{review.adminReply}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-5 border-t border-white/5">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleToggle(review.id, 'isApproved', review.isApproved)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        review.isApproved 
                        ? 'bg-white/5 hover:bg-white/10 text-white' 
                        : 'bg-success text-white hover:bg-success/90 shadow-lg shadow-success/20'
                      }`}
                    >
                      {review.isApproved ? 'Hide' : 'Approve'}
                    </button>
                    <button 
                      onClick={() => { setReplyModal(review); setReplyText(review.adminReply || ''); }}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
                    >
                      Reply
                    </button>
                  </div>
                  <button 
                    onClick={() => handleDelete(review.id)} 
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <Modal isOpen={!!replyModal} onClose={() => setReplyModal(null)} title={`Reply to ${replyModal?.userName}`}>
        <div className="space-y-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 italic text-sm text-text-muted">
            "{replyModal?.comment}"
          </div>
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Admin Response</label>
            <textarea 
              rows="5" 
              value={replyText} 
              onChange={e => setReplyText(e.target.value)} 
              className="input-field resize-none" 
              placeholder="Thank the customer or address their concerns..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button onClick={() => setReplyModal(null)} className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-sm text-text-muted transition-all">Cancel</button>
            <button onClick={handleReply} className="px-8 py-2 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
              Send Response
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
