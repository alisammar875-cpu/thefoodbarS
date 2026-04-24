import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, User, MapPin, ShoppingBag, Mail, Phone, Calendar, Coins, Eye, ChevronRight, ArrowUpRight } from 'lucide-react';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        const oSnap = await getDocs(collection(db, 'orders'));
        
        const orders = oSnap.docs.map(d => d.data());
        
        const custs = snap.docs.map(d => {
          const userData = d.data();
          const userOrders = orders.filter(o => o.customerId === userData.uid || o.customerId === d.id);
          const totalSpent = userOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
          
          return {
            docId: d.id,
            ...userData,
            orderCount: userOrders.length,
            totalSpent
          };
        });

        setCustomers(custs);
      } catch (error) {
        console.error(error);
        addToast("Failed to load customer data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const fetchCustomerOrders = async (customerId) => {
    try {
      const q = query(collection(db, 'orders'), where('customerId', '==', customerId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setCustomerOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.uid || customer.docId);
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-wider uppercase">CUSTOMER <span className="text-primary">BASE</span></h1>
          <p className="text-text-muted">Manage your users, loyalty points and purchase history.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-card px-5 py-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Users</span>
            <span className="text-xl font-display">{customers.length}</span>
          </div>
          <div className="glass-card px-5 py-3 flex flex-col items-center border-success/20">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Today</span>
            <span className="text-xl font-display text-success">
              {customers.filter(c => {
                const date = c.createdAt ? (c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt)) : new Date(0);
                return date.toDateString() === new Date().toDateString();
              }).length}
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input 
          type="text" 
          placeholder="Search by name, email or phone number..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-primary transition-all shadow-inner"
        />
      </div>

      <div className="glass-card overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/5 text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-white/10">
                <th className="py-5 px-6">Customer Profile</th>
                <th className="py-5 px-6">Contact Info</th>
                <th className="py-5 px-6 text-center">Loyalty Points</th>
                <th className="py-5 px-6 text-center">Orders</th>
                <th className="py-5 px-6 text-center">Total Spent</th>
                <th className="py-5 px-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan="6" className="py-24 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="6" className="py-24 text-center text-text-muted">No customers found matching your search.</td></tr>
                ) : (
                  filtered.map((user) => (
                    <motion.tr 
                      key={user.docId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-base text-white">{user.name}</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Joined {user.createdAt ? (user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : new Date(user.createdAt).toLocaleDateString()) : 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-xs"><Mail className="w-3 h-3 text-text-muted" /> {user.email}</p>
                          <p className="flex items-center gap-2 text-xs text-text-muted"><Phone className="w-3 h-3" /> {user.phone || 'No phone'}</p>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg">
                          <Coins className="w-3.5 h-3.5" />
                          <span className="font-bold">{user.loyaltyPoints || 0}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 text-white border border-white/5 rounded-lg">
                          <ShoppingBag className="w-3.5 h-3.5 text-text-muted" />
                          <span className="font-bold">{user.orderCount}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-center">
                        <p className="font-display text-lg text-primary">Rs. {user.totalSpent.toLocaleString()}</p>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button 
                          onClick={() => handleCustomerClick(user)}
                          className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white border border-white/5"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  )
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title={`CUSTOMER PROFILE: ${selectedCustomer.name}`}>
          <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar pb-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-6 border-white/10">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Account Snapshot</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Total Spent</span>
                    <span className="font-display text-primary text-xl">Rs. {selectedCustomer.totalSpent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Orders</span>
                    <span className="font-bold">{selectedCustomer.orderCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-muted">Loyalty Balance</span>
                    <span className="font-bold text-secondary flex items-center gap-1">
                      <Coins className="w-4 h-4" /> {selectedCustomer.loyaltyPoints || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 glass-card p-6 border-white/10">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Contact & Delivery</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] text-text-muted uppercase mb-1">Email Address</p>
                    <p className="text-sm font-medium">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted uppercase mb-1">Phone Number</p>
                    <p className="text-sm font-medium">{selectedCustomer.phone || 'Not provided'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-text-muted uppercase mb-1">Saved Addresses</p>
                    <div className="space-y-2 mt-2">
                      {selectedCustomer.addresses?.length > 0 ? selectedCustomer.addresses.map((addr, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <div className="text-xs leading-relaxed">
                            <span className="font-bold text-white uppercase tracking-tighter text-[8px] bg-primary/20 px-1.5 py-0.5 rounded mr-2">{addr.label}</span>
                            {addr.fullAddress || `${addr.street}, ${addr.area}, ${addr.city}`}
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-text-muted italic">No addresses saved yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" /> RECENT ORDERS
              </h3>
              <div className="space-y-3">
                {customerOrders.length > 0 ? customerOrders.map((order, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/10 font-mono text-[10px] font-bold">
                        #{order.id?.slice(-4)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">Rs. {order.total}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest">{new Date(order.createdAt?.toDate ? order.createdAt.toDate() : order.createdAt).toLocaleDateString()} · {order.items?.length} Items</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-success/20 text-success' : 
                        order.status === 'cancelled' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-text-muted'
                      }`}>
                        {order.status}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-text-muted opacity-30" />
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 text-text-muted text-sm">
                    No orders found for this customer.
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
