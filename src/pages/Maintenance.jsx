import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Clock, Phone, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Maintenance() {
  return (
    <div className="fixed inset-0 z-[10000] bg-[#080808] overflow-y-auto custom-scrollbar">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-[15%] w-[45%] h-[45%] bg-primary/10 rounded-full blur-[60px] md:blur-[120px] animate-mesh" />
        <div className="absolute bottom-1/4 right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[60px] md:blur-[120px] animate-mesh" style={{ animationDelay: '-8s' }} />
      </div>

      <div className="min-h-screen flex items-center justify-center p-6 md:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full text-center"
        >
          <div className="mb-8 md:mb-12">
            <img src={logo} alt="Logo" className="h-16 md:h-24 w-auto mx-auto mb-6 md:mb-8 animate-pulse" />
            <div className="inline-flex items-center gap-3 px-4 py-2 md:px-5 md:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-[8px] md:text-xs uppercase tracking-[0.3em] mb-6 md:mb-8">
              <Settings className="w-3 h-3 md:w-4 md:h-4 animate-spin-slow" /> Under Maintenance
            </div>
            <h1 className="text-3xl md:text-7xl font-display tracking-tighter mb-4 md:mb-6 leading-[1.1]">
              WE'RE COOKING <span className="text-primary">SOMETHING NEW.</span>
            </h1>
            <p className="text-sm md:text-lg text-text-muted leading-relaxed font-medium mb-8 md:mb-12 px-4 md:px-0">
              The Food Bar is currently undergoing scheduled maintenance to improve your experience. We'll be back shortly with even better service and bold new flavors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            <div className="glass-card p-5 md:p-6 border-white/5 flex flex-col items-center">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary mb-3" />
              <p className="text-[8px] md:text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Back In</p>
              <p className="text-xs md:text-sm font-bold text-white">Few Minutes</p>
            </div>
            <div className="glass-card p-5 md:p-6 border-white/5 flex flex-col items-center">
              <Phone className="w-5 h-5 md:w-6 md:h-6 text-primary mb-3" />
              <p className="text-[8px] md:text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Call Us</p>
              <p className="text-xs md:text-sm font-bold text-white">+92-300-0000000</p>
            </div>
            <div className="glass-card p-5 md:p-6 border-white/5 flex flex-col items-center">
              <Mail className="w-5 h-5 md:w-6 md:h-6 text-primary mb-3" />
              <p className="text-[8px] md:text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Email</p>
              <p className="text-xs md:text-sm font-bold text-white">hello@tfb.com</p>
            </div>
          </div>

          <div className="text-[8px] md:text-[10px] font-bold text-text-muted uppercase tracking-[0.5em] opacity-40 pb-8">
            Thank you for your patience
          </div>
        </motion.div>
      </div>
    </div>
  );
}
