import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import { Plus, Edit2, Trash2, GripVertical, Info, Layers } from 'lucide-react';
import Modal from '../components/Modal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({ name: '', emoji: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
      const snap = await getDocs(q);
      setCategories(snap.docs.map(d => ({id: d.id, ...d.data()})));
    } catch (error) {
      console.error(error);
      addToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ name: cat.name, emoji: cat.emoji || '' });
    } else {
      setEditingCat(null);
      setFormData({ name: '', emoji: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCat) {
        await updateDoc(doc(db, 'categories', editingCat.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        addToast("Category updated", "success");
      } else {
        const newId = `c_${Date.now()}`;
        const newCat = { 
          ...formData, 
          id: newId, 
          displayOrder: categories.length + 1,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'categories', newId), newCat);
        addToast("Category created", "success");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      addToast("Error saving category", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure? This doesn't delete items in this category, but they will be 'Uncategorized'.")) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      addToast("Category deleted", "success");
      fetchCategories();
    } catch(error) {
      addToast("Failed to delete", "error");
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({ ...item, displayOrder: index + 1 }));
    setCategories(updatedItems);

    try {
      // Background update
      const updatePromises = updatedItems.map(item => 
        updateDoc(doc(db, 'categories', item.id), { displayOrder: item.displayOrder })
      );
      await Promise.all(updatePromises);
      addToast("Order updated", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to save reorder", "error");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-wider uppercase">CATEGORY <span className="text-primary">MANAGEMENT</span></h1>
          <p className="text-text-muted">Organize your menu and control the display order.</p>
        </div>
        <button onClick={() => openModal()} className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" /> ADD CATEGORY
        </button>
      </div>

      <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center gap-3">
        <Info className="w-5 h-5 text-primary shrink-0" />
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest leading-relaxed">
          Drag and drop categories to reorder them on the public menu. The first category is the default view.
        </p>
      </div>

      <div className="glass-card border-white/5 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-white/5">
                  <AnimatePresence>
                    {categories.map((cat, index) => (
                      <Draggable key={cat.id} draggableId={cat.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-6 transition-all ${
                              snapshot.isDragging ? 'bg-white/10 backdrop-blur-xl z-[100] shadow-2xl scale-[1.02]' : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-center gap-6">
                              <div {...provided.dragHandleProps} className="text-text-muted hover:text-white cursor-grab active:cursor-grabbing p-1">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-3xl border border-white/10 shadow-inner">
                                {cat.emoji}
                              </div>
                              <div>
                                <h3 className="font-display text-xl tracking-wide">{cat.name}</h3>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Position: {cat.displayOrder}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => openModal(cat)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white border border-white/5">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(cat.id)} className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all border border-primary/10">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCat ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Category Name *</label>
              <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="input-field" placeholder="e.g. Burgers, Wraps, Sides" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Icon / Emoji *</label>
              <div className="flex gap-4 items-center">
                <input required type="text" value={formData.emoji} onChange={e=>setFormData({...formData, emoji: e.target.value})} className="input-field text-3xl h-16 w-24 text-center p-0" placeholder="🍔" maxLength={2} />
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest flex-1">
                  Choose a relevant emoji that represents this category visually.
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex justify-end gap-3 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="px-10 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-70 shadow-lg shadow-primary/20">
              {saving ? 'Processing...' : (editingCat ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
