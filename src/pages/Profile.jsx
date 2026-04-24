import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { User, ShoppingBag, MapPin, Star, Edit2, Trash2, Plus, ChevronDown, ChevronUp, Eye, Trophy } from 'lucide-react';
import { STATUS_COLORS } from '../constants/config';
import Modal from '../components/Modal';

export default function Profile() {
  const { currentUser, userProfile, updateProfile, updateUserPassword } = useAuth();
  const { addToast } = useToast();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ label: 'Home', street: '', area: '', city: 'Karachi', isDefault: false });

  useEffect(() => {
    if (userProfile) {
      setProfileForm({ name: userProfile.name || '', phone: userProfile.phone || '' });
    }
  }, [userProfile]);

  useEffect(() => {
    if (activeTab === 'orders' && currentUser) fetchOrders();
    if (activeTab === 'reviews' && currentUser) fetchReviews();
  }, [activeTab, currentUser]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const q = query(collection(db, 'orders'), where('customerId', '==', currentUser.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(list);
    } catch { }
    setLoadingOrders(false);
  };

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, 'reviews'), where('userId', '==', currentUser.uid));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch { }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: profileForm.name, phone: profileForm.phone });
      addToast('Profile updated!', 'success');
    } catch (error) {
      addToast(error.message, 'error');
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) return addToast('Passwords do not match.', 'error');
    if (passwordForm.newPass.length < 6) return addToast('Password must be at least 6 characters.', 'error');
    try {
      await updateUserPassword(passwordForm.newPass);
      addToast('Password updated!', 'success');
      setPasswordForm({ current: '', newPass: '', confirm: '' });
    } catch (error) {
      addToast('Please re-login to change password.', 'error');
    }
  };

  const handleSaveAddress = async () => {
    const addresses = userProfile?.addresses || [];
    const newAddr = { ...addressForm, id: editingAddress?.id || `addr_${Date.now()}` };
    
    let updated;
    if (editingAddress) {
      updated = addresses.map(a => a.id === editingAddress.id ? newAddr : a);
    } else {
      updated = [...addresses, newAddr];
    }
    if (newAddr.isDefault) updated = updated.map(a => ({ ...a, isDefault: a.id === newAddr.id }));

    await updateProfile({ addresses: updated });
    addToast(editingAddress ? 'Address updated!' : 'Address added!', 'success');
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressForm({ label: 'Home', street: '', area: '', city: 'Karachi', isDefault: false });
  };

  const handleDeleteAddress = async (addrId) => {
    const updated = (userProfile?.addresses || []).filter(a => a.id !== addrId);
    await updateProfile({ addresses: updated });
    addToast('Address deleted.', 'success');
  };

  const handleSetDefault = async (addrId) => {
    const updated = (userProfile?.addresses || []).map(a => ({ ...a, isDefault: a.id === addrId }));
    await updateProfile({ addresses: updated });
    addToast('Default address set.', 'success');
  };

  const handleReorder = (orderItems) => {
    orderItems.forEach(item => addItem(item, item.quantity));
    addToast('Items added to cart!', 'success');
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      addToast('Review deleted.', 'success');
    } catch { addToast('Failed to delete.', 'error'); }
  };

  const tabs = [
    { key: 'profile', label: 'My Profile', icon: User },
    { key: 'orders', label: 'My Orders', icon: ShoppingBag },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'reviews', label: 'My Reviews', icon: Star },
  ];

  const getStatusStyle = (status) => {
    const key = status?.toLowerCase().replace(/ /g, '_');
    return STATUS_COLORS[key] || STATUS_COLORS.pending;
  };

  return (
    <div className="pt-28 pb-24 min-h-screen container mx-auto px-4">
      <h1 className="text-4xl md:text-5xl font-display mb-8">MY <span className="text-primary">ACCOUNT</span></h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto mb-8 pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key ? 'bg-primary text-white' : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/10'
              }`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══ TAB: PROFILE ═══ */}
      {activeTab === 'profile' && (
        <div className="space-y-8 max-w-2xl">
          <div className="glass-card p-8">
            <h3 className="font-display text-xl mb-6 border-b border-white/10 pb-3">PERSONAL INFO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Full Name</label>
                <input type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Phone</label>
                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-text-muted mb-1.5">Email</label>
                <input type="email" value={currentUser?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
              </div>
            </div>

            {/* Loyalty Points */}
            <div className="mt-6 p-4 bg-secondary/10 border border-secondary/20 rounded-xl flex items-center gap-4">
              <Trophy className="w-8 h-8 text-secondary shrink-0" />
              <div>
                <p className="font-bold">🏆 You have <span className="text-secondary">{userProfile?.loyaltyPoints || 0} points</span></p>
                <p className="text-xs text-text-muted">500 points = Rs. 50 off — Coming Soon</p>
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.96 }} onClick={handleSaveProfile} disabled={saving}
              className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-70">
              {saving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>

          <div className="glass-card p-8">
            <h3 className="font-display text-xl mb-6 border-b border-white/10 pb-3">CHANGE PASSWORD</h3>
            <div className="space-y-4 max-w-md">
              <input type="password" placeholder="New Password" value={passwordForm.newPass} onChange={e => setPasswordForm({ ...passwordForm, newPass: e.target.value })} className="input-field" />
              <input type="password" placeholder="Confirm New Password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="input-field" />
              <motion.button whileTap={{ scale: 0.96 }} onClick={handleChangePassword} className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/10">
                Update Password
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: ORDERS ═══ */}
      {activeTab === 'orders' && (
        <div className="space-y-4 max-w-4xl">
          {loadingOrders ? (
            <div className="text-center py-16 text-text-muted">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <div className="text-5xl mb-4">🛍️</div>
              <h3 className="text-2xl font-display mb-2">NO ORDERS YET</h3>
              <p className="text-text-muted mb-6">Place your first order and earn loyalty points!</p>
              <button onClick={() => navigate('/menu')} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Order Now →</button>
            </div>
          ) : (
            orders.map(order => {
              const style = getStatusStyle(order.status);
              const isExpanded = expandedOrder === order.id;
              return (
                <div key={order.id || order.docId} className="glass-card overflow-hidden">
                  <button onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-full p-5 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div>
                        <p className="font-bold text-sm font-mono">{order.id}</p>
                        <p className="text-xs text-text-muted">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`${style.bg} ${style.text} px-3 py-1 rounded-full text-xs font-bold capitalize`}>{order.status}</span>
                    <span className="font-display text-primary text-lg">PKR {order.total}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </button>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      className="px-5 pb-5 border-t border-white/5 pt-4 space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-text-muted">PKR {item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
                        <button onClick={() => navigate(`/track/${order.id}`)} className="flex items-center gap-1 text-xs bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 border border-white/10">
                          <Eye className="w-3 h-3" /> Track
                        </button>
                        <button onClick={() => handleReorder(order.items)} className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-4 py-2 rounded-lg hover:bg-primary/30">
                          <Plus className="w-3 h-3" /> Reorder
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ TAB: ADDRESSES ═══ */}
      {activeTab === 'addresses' && (
        <div className="space-y-4 max-w-2xl">
          <button onClick={() => { setEditingAddress(null); setAddressForm({ label: 'Home', street: '', area: '', city: 'Karachi', isDefault: false }); setShowAddressModal(true); }}
            className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-text-muted hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 font-bold">
            <Plus className="w-5 h-5" /> Add New Address
          </button>

          {(userProfile?.addresses || []).length === 0 && (
            <p className="text-center text-text-muted py-8">No saved addresses yet.</p>
          )}

          {(userProfile?.addresses || []).map(addr => (
            <div key={addr.id} className={`glass-card p-5 flex items-start justify-between gap-4 ${addr.isDefault ? 'border-green-500/30' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold">{addr.label}</span>
                  {addr.isDefault && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
                </div>
                <p className="text-sm text-text-muted">{addr.street}, {addr.area}, {addr.city}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-xs text-text-muted hover:text-white px-2 py-1 rounded bg-white/5 border border-white/10">Set Default</button>
                )}
                <button onClick={() => { setEditingAddress(addr); setAddressForm(addr); setShowAddressModal(true); }} className="text-text-muted hover:text-white"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-text-muted hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}

          {/* Address Modal */}
          <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title={editingAddress ? 'Edit Address' : 'Add Address'}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Label</label>
                <select value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className="input-field bg-black/40">
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Street Address *</label>
                <input required type="text" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className="input-field bg-black/40" placeholder="House 123, Street 4" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Area *</label>
                  <input required type="text" value={addressForm.area} onChange={e => setAddressForm({ ...addressForm, area: e.target.value })} className="input-field bg-black/40" placeholder="DHA Phase 6" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">City</label>
                  <input type="text" value={addressForm.city} readOnly className="input-field bg-black/40 opacity-60 cursor-not-allowed" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="accent-primary w-4 h-4" />
                <span className="text-sm">Set as default address</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={() => setShowAddressModal(false)} className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5">Cancel</button>
                <button onClick={handleSaveAddress} disabled={!addressForm.street || !addressForm.area} className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50">
                  {editingAddress ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </Modal>
        </div>
      )}

      {/* ═══ TAB: REVIEWS ═══ */}
      {activeTab === 'reviews' && (
        <div className="space-y-4 max-w-2xl">
          {reviews.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-2xl font-display mb-2">NO REVIEWS YET</h3>
              <p className="text-text-muted">Share your thoughts after ordering!</p>
            </div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className="glass-card p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{review.itemName}</p>
                    <div className="flex text-secondary gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-current' : 'opacity-30'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${review.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {review.isApproved ? 'Approved' : 'Awaiting Approval'}
                    </span>
                    <button onClick={() => handleDeleteReview(review.id)} className="text-text-muted hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-sm text-text-muted mt-2">{review.comment}</p>
                {review.adminReply && (
                  <div className="mt-3 pl-4 border-l-2 border-primary/30">
                    <p className="text-sm italic text-white/70">{review.adminReply}</p>
                    <p className="text-xs text-primary mt-1">— The Food Bar</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
