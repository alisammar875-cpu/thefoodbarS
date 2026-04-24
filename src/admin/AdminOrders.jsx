import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import { Search, Filter, Eye, Printer, Phone, MapPin, Clock, Package, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_LABELS, STATUS_COLORS } from '../constants/config';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { addToast } = useToast();

  const STATUS_LIST = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ docId: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      addToast("Error loading orders", "error");
    });
    return () => unsub();
  }, []);

  const handleStatusUpdate = async (orderDocId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderDocId), { 
        status: newStatus, 
        updatedAt: new Date().toISOString() 
      });
      addToast(`Order updated to ${STATUS_LABELS[newStatus]}`, 'success');
      if (selectedOrder && selectedOrder.docId === orderDocId) {
        setSelectedOrder({...selectedOrder, status: newStatus});
      }
    } catch (error) {
      console.error(error);
      addToast("Failed to update status", "error");
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    return STATUS_COLORS[s] || { bg: 'bg-white/10', text: 'text-text-muted' };
  };

  const isNewOrder = (createdAt) => {
    if (!createdAt) return false;
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const diff = (new Date() - date) / (1000 * 60); // minutes
    return diff < 10;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-wider uppercase">ORDER <span className="text-primary">MANAGEMENT</span></h1>
          <p className="text-text-muted">Real-time order stream and fulfillment tracking.</p>
        </div>
        <div className="flex gap-2">
          <div className="glass-card px-4 py-2 flex flex-col items-center">
            <span className="text-[10px] font-bold text-text-muted uppercase">Pending</span>
            <span className="text-xl font-display text-yellow-500">{orders.filter(o=>o.status==='pending').length}</span>
          </div>
          <div className="glass-card px-4 py-2 flex flex-col items-center">
            <span className="text-[10px] font-bold text-text-muted uppercase">Today</span>
            <span className="text-xl font-display text-primary">{orders.filter(o => {
              const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
              return d.toDateString() === new Date().toDateString();
            }).length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="lg:col-span-4 flex flex-wrap gap-2">
          {['All', ...STATUS_LIST].map(s => (
            <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                statusFilter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/10'
              }`}
            >
              {s === 'All' ? 'All Orders' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/5 text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-white/10">
                <th className="py-5 px-6">Order Info</th>
                <th className="py-5 px-6">Customer</th>
                <th className="py-5 px-6">Items & Amount</th>
                <th className="py-5 px-6 text-center">Status</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan="5" className="py-24 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="5" className="py-24 text-center text-text-muted">No orders found matching your criteria.</td></tr>
                ) : filteredOrders.map((order) => {
                  const style = getStatusStyle(order.status);
                  const isNew = isNewOrder(order.createdAt);
                  return (
                    <motion.tr 
                      key={order.docId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isNew ? 'bg-primary animate-pulse' : 'bg-transparent'}`} />
                          <div>
                            <p className="font-mono font-bold text-xs tracking-wider">{order.id}</p>
                            <p className="text-[10px] text-text-muted uppercase mt-0.5">
                              {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'N/A'}
                            </p>
                            {isNew && <span className="inline-block mt-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <p className="font-bold text-base">{order.customerName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5">
                          <Phone className="w-3 h-3" /> {order.customerPhone}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-3 overflow-hidden">
                            {order.items?.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="inline-block h-8 w-8 rounded-lg ring-2 ring-bg-dark bg-black overflow-hidden border border-white/10">
                                <img src={item.imageUrl} className="h-full w-full object-cover" alt="" />
                              </div>
                            ))}
                            {order.items?.length > 3 && (
                              <div className="inline-flex items-center justify-center h-8 w-8 rounded-lg ring-2 ring-bg-dark bg-white/5 border border-white/10 text-[10px] font-bold">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-display text-lg text-primary">Rs. {order.total}</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{order.items?.length} Items · COD</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col items-center gap-2">
                          <select 
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.docId, e.target.value)}
                            className={`text-[10px] font-bold px-4 py-2 rounded-xl outline-none border transition-all cursor-pointer uppercase tracking-widest ${style.bg} ${style.text} ${style.border || 'border-transparent'}`}
                          >
                            {STATUS_LIST.map(s => <option key={s} value={s} className="bg-bg-dark text-white">{STATUS_LABELS[s]}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedOrder(order)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white border border-white/5">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`ORDER DETAILS: ${selectedOrder.id}`}>
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar pb-6">
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass-card p-5 border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"><Package className="w-5 h-5" /></div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Status Info</h4>
                </div>
                <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest mb-3 ${getStatusStyle(selectedOrder.status).bg} ${getStatusStyle(selectedOrder.status).text}`}>
                  {STATUS_LABELS[selectedOrder.status]}
                </div>
                <p className="text-[10px] text-text-muted uppercase mb-1 font-bold">Updated At</p>
                <p className="text-xs">{selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>

              <div className="glass-card p-5 border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><CheckCircle className="w-5 h-5" /></div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Customer Detail</h4>
                </div>
                <p className="font-bold text-base mb-1">{selectedOrder.customerName}</p>
                <p className="text-xs text-text-muted flex items-center gap-1 mb-1"><Phone className="w-3 h-3" /> {selectedOrder.customerPhone}</p>
                <p className="text-xs text-text-muted truncate">{selectedOrder.customerEmail}</p>
              </div>

              <div className="glass-card p-5 border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary"><MapPin className="w-5 h-5" /></div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">Delivery Address</h4>
                </div>
                <p className="text-xs leading-relaxed font-medium">
                  {typeof selectedOrder.address === 'string' ? selectedOrder.address : (selectedOrder.address?.fullAddress || `${selectedOrder.address?.street}, ${selectedOrder.address?.area}, ${selectedOrder.address?.city}`)}
                </p>
                {selectedOrder.notes && (
                  <div className="mt-3 p-2.5 bg-black/40 rounded-xl text-[10px] border border-white/5 italic">
                    <span className="text-secondary font-bold block mb-1 uppercase">Order Notes:</span>
                    {selectedOrder.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6 border-white/10">
              <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6 flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> ITEMS ORDERED ({selectedOrder.items?.length})
              </h4>
              <div className="space-y-3 mb-8">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-black/50 rounded-xl overflow-hidden border border-white/10">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-text-muted font-bold tracking-widest uppercase mt-1">{item.quantity} × Rs. {item.price}</p>
                        {item.specialInstructions && <p className="text-[10px] text-primary italic mt-1 font-medium">"{item.specialInstructions}"</p>}
                      </div>
                    </div>
                    <span className="font-display text-xl text-white">Rs. {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Payment Type</p>
                  <p className="text-sm flex items-center gap-2">💵 Cash on Delivery</p>
                </div>
                <div className="space-y-3 text-right">
                  <div className="flex justify-between text-xs text-text-muted font-bold uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs text-text-muted font-bold uppercase tracking-widest">
                    <span>Delivery</span>
                    <span>Rs. {selectedOrder.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-display text-3xl text-primary pt-3 border-t border-white/5">
                    <span>TOTAL</span>
                    <span>Rs. {selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-white/10">
              <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
              </div>
              <div className="flex gap-3">
                {selectedOrder.status !== 'cancelled' && (
                  <button 
                    onClick={() => {
                      if(window.confirm("Cancel this order?")) handleStatusUpdate(selectedOrder.docId, 'cancelled');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Order
                  </button>
                )}
                <div className="flex gap-2">
                  {STATUS_LIST.filter(s => s !== selectedOrder.status && s !== 'cancelled').slice(0, 2).map(nextStatus => (
                    <button 
                      key={nextStatus}
                      onClick={() => handleStatusUpdate(selectedOrder.docId, nextStatus)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-success/10 border border-success/20 text-success rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-success/20 transition-all"
                    >
                      Move to {STATUS_LABELS[nextStatus]} <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
