import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../contexts/ToastContext';
import { Save, Settings, Info, Share2, Phone, Mail, Globe, Clock, ShieldAlert, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "The Food Bar",
    deliveryFee: 100,
    estimatedDelivery: "30-45 minutes",
    isAcceptingOrders: true,
    maintenanceMode: false,
    announcementBanner: "",
    contactEmail: "hello@thefoodbar.com",
    contactPhone: "+92-300-0000000",
    address: "Karachi, Pakistan",
    openingHours: "11 AM — 3 AM Daily",
    socialLinks: { instagram: '', facebook: '', tiktok: '', twitter: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'site_config', 'main');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setSettings(prev => ({...prev, ...snap.data()}));
        }
      } catch (error) {
        console.error(error);
        addToast("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'site_config', 'main'), {
        ...settings,
        updatedAt: new Date().toISOString()
      });
      addToast("Settings saved successfully", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to save settings", "error");
    }
    setSaving(false);
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value }
    }));
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display tracking-wider uppercase">SITE <span className="text-primary">SETTINGS</span></h1>
          <p className="text-text-muted">Global configuration for your storefront and operations.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-70"
        >
          <Save className="w-5 h-5" />
          {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - General & Operations */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-8 border-white/5">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Store Operations
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="col-span-2 space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${settings.isAcceptingOrders ? 'bg-success/5 border-success/20' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div>
                    <p className="font-bold text-sm">Store Availability</p>
                    <p className="text-xs text-text-muted">Control whether customers can place new orders.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, isAcceptingOrders: !settings.isAcceptingOrders})}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${settings.isAcceptingOrders ? 'bg-success' : 'bg-white/10'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.isAcceptingOrders ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${settings.maintenanceMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/10'}`}>
                  <div>
                    <p className="font-bold text-sm flex items-center gap-2">
                      Maintenance Mode {settings.maintenanceMode && <ShieldAlert className="w-4 h-4 text-orange-500" />}
                    </p>
                    <p className="text-xs text-text-muted">Hide the storefront and show a maintenance message.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${settings.maintenanceMode ? 'bg-orange-500' : 'bg-white/10'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Delivery Fee (PKR)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="number" required value={settings.deliveryFee} onChange={e => setSettings({...settings, deliveryFee: Number(e.target.value)})} className="input-field pl-12" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Estimated Delivery Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="text" required value={settings.estimatedDelivery} onChange={e => setSettings({...settings, estimatedDelivery: e.target.value})} className="input-field pl-12" placeholder="e.g. 30-45 minutes" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Announcement Banner</label>
                <textarea 
                  rows="2"
                  value={settings.announcementBanner || ''} 
                  onChange={e => setSettings({...settings, announcementBanner: e.target.value})} 
                  className="input-field resize-none" 
                  placeholder="🎉 FREE DELIVERY on your first order! Use code: FIRST (Leave empty to hide)"
                />
              </div>
            </div>
          </section>

          <section className="glass-card p-8 border-white/5">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> Contact & Localization
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Store Name</label>
                <input type="text" required value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Opening Hours</label>
                <input type="text" required value={settings.openingHours} onChange={e => setSettings({...settings, openingHours: e.target.value})} className="input-field" placeholder="11 AM - 3 AM Daily" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Business Address</label>
                <input type="text" required value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="email" required value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} className="input-field pl-12" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input type="text" required value={settings.contactPhone} onChange={e => setSettings({...settings, contactPhone: e.target.value})} className="input-field pl-12" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Social & Info */}
        <div className="space-y-8">
          <section className="glass-card p-8 border-white/5">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" /> Social Presence
            </h3>
            <div className="space-y-4">
              {['instagram', 'facebook', 'tiktok', 'twitter'].map(platform => (
                <div key={platform}>
                  <label className="block text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 capitalize">{platform}</label>
                  <input 
                    type="url" 
                    name={platform} 
                    value={settings.socialLinks?.[platform] || ''} 
                    onChange={handleSocialChange} 
                    className="input-field text-xs" 
                    placeholder={`https://${platform}.com/handle`} 
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 p-8 rounded-2xl">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> System Info
            </h3>
            <div className="space-y-3 text-[10px] font-bold uppercase tracking-wider text-text-muted">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="text-white">v2.0.5-prod</span>
              </div>
              <div className="flex justify-between">
                <span>Engine</span>
                <span className="text-white">Vite + React</span>
              </div>
              <div className="flex justify-between">
                <span>Backend</span>
                <span className="text-white">Firebase Cloud</span>
              </div>
              <div className="flex justify-between">
                <span>Last Saved</span>
                <span className="text-white">{settings.updatedAt ? new Date(settings.updatedAt).toLocaleTimeString() : 'N/A'}</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-primary/20">
              <p className="text-[10px] text-primary font-bold italic">"Quality is not an act, it is a habit."</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
