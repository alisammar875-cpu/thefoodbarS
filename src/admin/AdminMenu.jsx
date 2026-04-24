import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import { Plus, Edit2, Trash2, Search, Filter, Star, Eye, EyeOff } from 'lucide-react';
import Modal from '../components/Modal';
import ImageUploader from '../components/ImageUploader';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '', description: '', shortDescription: '', price: '', originalPrice: '', category: '', 
    isAvailable: true, isFeatured: false, isNew: false, prepTimeMinutes: '', calories: '', tags: []
  });
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const catSnap = await getDocs(query(collection(db, 'categories'), orderBy('displayOrder', 'asc')));
      setCategories(catSnap.docs.map(d => ({id: d.id, ...d.data()})));

      const itemsSnap = await getDocs(query(collection(db, 'menu_items'), orderBy('createdAt', 'desc')));
      setItems(itemsSnap.docs.map(d => ({id: d.id, ...d.data()})));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '', description: item.description || '', shortDescription: item.shortDescription || '',
        price: item.price || '', originalPrice: item.originalPrice || '', category: item.category || '', 
        isAvailable: item.isAvailable ?? true, isFeatured: item.isFeatured || false, isNew: item.isNew || false,
        prepTimeMinutes: item.prepTimeMinutes || '', calories: item.calories || '', tags: item.tags || []
      });
      setImageUrl(item.imageUrl || '');
    } else {
      setEditingItem(null);
      setFormData({ 
        name: '', description: '', shortDescription: '', price: '', originalPrice: '', category: categories[0]?.name || '', 
        isAvailable: true, isFeatured: false, isNew: false, prepTimeMinutes: '15', calories: '', tags: []
      });
      setImageUrl('');
    }
    setIsModalOpen(true);
  };

  const handleTagsChange = (e) => {
    const val = e.target.value;
    const tagsArr = val.split(',').map(t => t.trim()).filter(Boolean);
    setFormData({...formData, tags: tagsArr});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) {
      addToast("Please upload an image first", "error");
      return;
    }

    setSaving(true);
    try {
      const itemData = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        prepTimeMinutes: formData.prepTimeMinutes ? Number(formData.prepTimeMinutes) : 15,
        calories: formData.calories ? Number(formData.calories) : null,
        imageUrl,
        updatedAt: new Date().toISOString()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'menu_items', editingItem.id), itemData);
        addToast("Item updated successfully", "success");
      } else {
        const newId = `m_${Date.now()}`;
        itemData.createdAt = new Date().toISOString();
        await setDoc(doc(db, 'menu_items', newId), itemData);
        addToast("Item created successfully", "success");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error(error);
      addToast(error.message, "error");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      addToast("Item deleted", "success");
      fetchData();
    } catch(error) {
      addToast("Failed to delete", "error");
    }
  };

  const toggleBoolean = async (item, field) => {
    try {
      await updateDoc(doc(db, 'menu_items', item.id), { [field]: !item[field] });
      setItems(items.map(i => i.id === item.id ? {...i, [field]: !i[field]} : i));
      addToast(`Updated ${field}`, "success");
    } catch(error) {
      addToast("Failed to update status", "error");
    }
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-wider">MENU MANAGEMENT</h1>
          <p className="text-text-muted">Configure your digital storefront and item availability.</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" /> ADD NEW ITEM
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all appearance-none"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="glass-card flex items-center justify-center gap-4 px-4 py-3">
          <div className="text-center">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Total Items</p>
            <p className="text-xl font-display">{items.length}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Available</p>
            <p className="text-xl font-display text-success">{items.filter(i=>i.isAvailable).length}</p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white/5 text-text-muted text-[10px] font-bold uppercase tracking-widest border-b border-white/10">
                <th className="py-4 px-6 w-24">Item</th>
                <th className="py-4 px-6">Details</th>
                <th className="py-4 px-6">Pricing</th>
                <th className="py-4 px-6 text-center">Featured</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan="6" className="py-20 text-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan="6" className="py-20 text-center text-text-muted">No menu items found.</td></tr>
                ) : filteredItems.map((item) => (
                  <motion.tr 
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="w-16 h-16 rounded-xl bg-black/50 overflow-hidden border border-white/10 relative group">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-base">{item.name}</p>
                      <p className="text-xs text-text-muted">{item.category}</p>
                      <div className="flex gap-1 mt-1">
                        {item.isNew && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">New</span>}
                        {item.tags?.map(t => <span key={t} className="text-[8px] bg-white/5 text-text-muted px-1.5 py-0.5 rounded font-bold uppercase">{t}</span>)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-display text-lg text-primary">Rs. {item.price}</p>
                      {item.originalPrice && <p className="text-xs text-text-muted line-through">Rs. {item.originalPrice}</p>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => toggleBoolean(item, 'isFeatured')}
                          className={`p-2 rounded-lg transition-colors ${item.isFeatured ? 'text-secondary bg-secondary/10' : 'text-text-muted hover:bg-white/5'}`}
                        >
                          <Star className={`w-5 h-5 ${item.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col items-center gap-2">
                        <button 
                          onClick={() => toggleBoolean(item, 'isAvailable')}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.isAvailable ? 'bg-success' : 'bg-white/10'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-[10px] font-bold uppercase ${item.isAvailable ? 'text-success' : 'text-red-500'}`}>
                          {item.isAvailable ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white border border-white/5">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all border border-primary/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Menu Item" : "Add New Item"}>
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-4 custom-scrollbar pb-4">
          
          <div className="space-y-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Item Image</p>
            <ImageUploader 
              initialImage={editingItem?.imageUrl} 
              onUploadSuccess={(url) => setImageUrl(url)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Item Name *</label>
              <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Double Smash Burger" />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Sale Price (Rs.) *</label>
              <input required type="number" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="input-field" placeholder="550" />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Compare Price (Rs.)</label>
              <input type="number" value={formData.originalPrice} onChange={e=>setFormData({...formData, originalPrice: e.target.value})} className="input-field" placeholder="e.g. 700" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Category *</label>
              <select required value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="input-field appearance-none">
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Short Description *</label>
              <input required type="text" maxLength={80} value={formData.shortDescription} onChange={e=>setFormData({...formData, shortDescription: e.target.value})} className="input-field" placeholder="Signature smashed beef patty with secret sauce..." />
              <div className="text-right text-[10px] text-text-muted mt-1 font-bold">{formData.shortDescription.length}/80</div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Full Description</label>
              <textarea rows="4" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="input-field resize-none" placeholder="Enter detailed description, ingredients, etc..."></textarea>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Prep Time (mins)</label>
              <input type="number" value={formData.prepTimeMinutes} onChange={e=>setFormData({...formData, prepTimeMinutes: e.target.value})} className="input-field" placeholder="15" />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Calories</label>
              <input type="number" value={formData.calories} onChange={e=>setFormData({...formData, calories: e.target.value})} className="input-field" placeholder="e.g. 550" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Tags (comma separated)</label>
              <input type="text" value={formData.tags.join(', ')} onChange={handleTagsChange} className="input-field" placeholder="spicy, bestseller, veg" />
            </div>
            
            <div className="col-span-2 grid grid-cols-3 gap-4">
              <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${formData.isAvailable ? 'border-success bg-success/5' : 'border-white/5 bg-white/5'}`}>
                <input type="checkbox" checked={formData.isAvailable} onChange={e=>setFormData({...formData, isAvailable: e.target.checked})} className="hidden" />
                <Eye className={formData.isAvailable ? 'text-success' : 'text-text-muted'} />
                <span className={`text-[10px] font-bold uppercase ${formData.isAvailable ? 'text-success' : 'text-text-muted'}`}>Active</span>
              </label>
              <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${formData.isFeatured ? 'border-secondary bg-secondary/5' : 'border-white/5 bg-white/5'}`}>
                <input type="checkbox" checked={formData.isFeatured} onChange={e=>setFormData({...formData, isFeatured: e.target.checked})} className="hidden" />
                <Star className={formData.isFeatured ? 'text-secondary fill-current' : 'text-text-muted'} />
                <span className={`text-[10px] font-bold uppercase ${formData.isFeatured ? 'text-secondary' : 'text-text-muted'}`}>Featured</span>
              </label>
              <label className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer ${formData.isNew ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/5'}`}>
                <input type="checkbox" checked={formData.isNew} onChange={e=>setFormData({...formData, isNew: e.target.checked})} className="hidden" />
                <Plus className={formData.isNew ? 'text-blue-500' : 'text-text-muted'} />
                <span className={`text-[10px] font-bold uppercase ${formData.isNew ? 'text-blue-500' : 'text-text-muted'}`}>New Tag</span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#161616] mt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-bold text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-10 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-70 shadow-lg shadow-primary/20">
              {saving ? 'Processing...' : (editingItem ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
