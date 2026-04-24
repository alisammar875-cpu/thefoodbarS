import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { ShoppingBag, DollarSign, Clock, Users, ArrowUpRight, ArrowDownRight, Package, Star, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { STATUS_COLORS } from '../constants/config';
import { useToast } from '../contexts/ToastContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalOrders: 0, 
    todayOrders: 0, 
    activeCustomers: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    // Real-time listener for orders to update dashboard stats
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const orders = snap.docs.map(d => ({ docId: d.id, ...d.data() }));
      
      const today = new Date();
      today.setHours(0,0,0,0);

      let revenue = 0;
      let todayO = 0;
      let pending = 0;
      let delivered = 0;
      const itemsMap = {};

      orders.forEach(o => {
        if (o.status !== 'cancelled') revenue += o.total;
        if (o.status === 'pending') pending++;
        if (o.status === 'delivered') delivered++;
        
        const dDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
        if (dDate >= today) todayO++;

        // Calculate top items
        o.items?.forEach(item => {
          itemsMap[item.name] = (itemsMap[item.name] || 0) + item.quantity;
        });
      });

      // Sort and set top items
      const sortedItems = Object.entries(itemsMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      setTopItems(sortedItems);

      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        todayOrders: todayO,
        activeCustomers: [...new Set(orders.map(o => o.customerId))].length,
        pendingOrders: pending,
        deliveredOrders: delivered
      });

      setRecentOrders(orders.slice(0, 5));

      // Generate Revenue Data (Last 7 Days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayRevenue = orders.filter(o => {
          const oDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
          return oDate.toDateString() === d.toDateString() && o.status !== 'cancelled';
        }).reduce((acc, curr) => acc + curr.total, 0);

        last7Days.push({
          name: days[d.getDay()],
          revenue: dayRevenue,
          orders: orders.filter(o => {
            const oDate = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
            return oDate.toDateString() === d.toDateString();
          }).length
        });
      }
      setRevenueData(last7Days);
      setAllOrders(orders);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleDownloadReport = () => {
    if (allOrders.length === 0) {
      addToast("No data available to download", "error");
      return;
    }

    try {
      const headers = ["Order ID", "Date", "Customer", "Phone", "Items", "Subtotal", "Delivery", "Total", "Status"];
      const rows = allOrders.map(o => [
        o.id,
        o.createdAt?.toDate ? o.createdAt.toDate().toLocaleString() : new Date(o.createdAt).toLocaleString(),
        o.customerName,
        o.customerPhone,
        o.items?.map(i => `${i.name} (${i.quantity})`).join('; '),
        o.subtotal,
        o.deliveryFee,
        o.total,
        o.status
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `TheFoodBar_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("Report downloaded successfully", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to generate report", "error");
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const statCards = [
    { 
      title: "Today's Orders", 
      value: stats.todayOrders, 
      trend: "+12%", 
      icon: ShoppingBag, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10' 
    },
    { 
      title: "Total Revenue", 
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`, 
      trend: "+8.4%", 
      icon: DollarSign, 
      color: 'text-success', 
      bg: 'bg-success/10' 
    },
    { 
      title: "Active Customers", 
      value: stats.activeCustomers, 
      trend: "+24", 
      icon: Users, 
      color: 'text-secondary', 
      bg: 'bg-secondary/10' 
    },
    { 
      title: "Pending Orders", 
      value: stats.pendingOrders, 
      trend: stats.pendingOrders > 5 ? "Action Needed" : "Stable", 
      icon: Clock, 
      color: stats.pendingOrders > 5 ? 'text-red-400' : 'text-primary', 
      bg: stats.pendingOrders > 5 ? 'bg-red-400/10' : 'bg-primary/10' 
    },
  ];

  const pieData = [
    { name: 'Pending', value: stats.pendingOrders, color: '#F59E0B' },
    { name: 'Delivered', value: stats.deliveredOrders, color: '#22C55E' },
    { name: 'Others', value: stats.totalOrders - stats.pendingOrders - stats.deliveredOrders, color: '#3B82F6' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-wider uppercase">DASHBOARD <span className="text-primary">OVERVIEW</span></h1>
          <p className="text-text-muted">Command center for your restaurant operations.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadReport}
            className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
          >
            Download Report
          </button>
          <div className="bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Real-time
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="glass-card p-6 relative overflow-hidden group hover:border-primary/30 transition-all"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-16 h-16 -mr-4 -mt-4 rotate-12" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center text-[10px] font-bold ${card.trend.includes('-') ? 'text-red-400' : 'text-success'}`}>
                  {card.trend.includes('+') ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {card.trend}
                </div>
              </div>
              <div>
                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-1">{card.title}</p>
                <p className="text-2xl font-display tracking-wide">{card.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 border-white/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-display tracking-wider">REVENUE PERFORMANCE</h3>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Gross Sales (Last 7 Days)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-text-muted uppercase">Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A25" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF8A25" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#404040" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                  fontWeight="bold"
                />
                <YAxis 
                  stroke="#404040" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `Rs.${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                  fontWeight="bold"
                />
                <Tooltip 
                  cursor={{stroke: '#FF8A25', strokeWidth: 1}} 
                  contentStyle={{backgroundColor: '#161616', border: '1px solid #222', borderRadius: '12px', fontSize: '12px'}} 
                  itemStyle={{color: '#FF8A25'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#FF8A25" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 border-white/5">
          <h3 className="text-lg font-display tracking-wider mb-6">ORDER STATUS</h3>
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#161616', border: '1px solid #222', borderRadius: '12px', fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{entry.name}</span>
                </div>
                <span className="text-sm font-bold">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display tracking-wider">RECENT ORDERS</h3>
            <Link to="/admin/orders" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/5 font-mono text-[10px] font-bold">
                    #{order.id?.slice(-4)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{order.customerName}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">{order.items?.length} Items · Rs. {order.total}</p>
                  </div>
                </div>
                <span className={`text-[8px] font-bold px-2 py-1 rounded uppercase tracking-widest ${STATUS_COLORS[order.status]?.bg} ${STATUS_COLORS[order.status]?.text}`}>
                  {order.status}
                </span>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <div className="py-12 text-center text-text-muted text-sm italic">No recent orders found.</div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-display tracking-wider">TOP SELLING ITEMS</h3>
            <Link to="/admin/menu" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Manage Menu</Link>
          </div>
          <div className="space-y-4">
            {topItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">Quantity Sold: {item.count}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 text-secondary fill-current" />)}
                </div>
              </div>
            ))}
            {topItems.length === 0 && (
              <div className="py-12 text-center text-text-muted text-sm italic">No sales data available.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
