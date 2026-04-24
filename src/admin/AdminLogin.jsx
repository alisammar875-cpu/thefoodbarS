import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, ArrowRight, ChefHat } from 'lucide-react';
import logo from '../assets/logo.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast("Authentication Successful", 'success');
      setTimeout(() => navigate('/admin/dashboard'), 1000);
    } catch (error) {
      addToast("Invalid credentials. Access Denied.", 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card p-10 md:p-14 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="mb-8 flex flex-col items-center"
            >
              <img src={logo} alt="The Food Bar" className="h-20 w-auto mb-4 drop-shadow-2xl" />
              <div className="w-12 h-1 bg-primary rounded-full opacity-50" />
            </motion.div>
            <h1 className="text-4xl font-display font-bold tracking-[0.2em] text-white uppercase mb-2">
              ADMIN <span className="text-primary">PORTAL</span>
            </h1>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-[0.3em] opacity-60 italic">Secure Access Terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Identity (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  required 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="input-field pl-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                  placeholder="admin@thefoodbar.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Security Key (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  required 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="input-field pl-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              disabled={loading} 
              className="w-full py-5 bg-primary text-white rounded-2xl font-bold tracking-[0.2em] uppercase text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-70 mt-8 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>INITIALIZE ACCESS <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3 text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-40 mb-4 justify-center">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Internal Demo Credentials</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button 
                type="button" 
                onClick={() => {setEmail('admin@thefoodbar.com'); setPassword('FoodBar@Admin2025');}}
                className="text-[10px] font-bold text-primary hover:text-white uppercase tracking-widest transition-colors py-2 px-6 border border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/20"
              >
                Auto-fill Master Credentials
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-30">
          © 2025 The Food Bar Group · All Rights Reserved
        </p>
      </motion.div>
    </div>
  );
}
