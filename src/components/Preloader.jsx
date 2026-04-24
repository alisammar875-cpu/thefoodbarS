import React from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function Preloader() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center"
      >
        {/* Animated Rings */}
        <div className="absolute inset-0 -m-8">
          <div className="w-full h-full border-2 border-primary/20 rounded-full animate-[spin_3s_linear_infinite]" />
        </div>
        <div className="absolute inset-0 -m-4">
          <div className="w-full h-full border-2 border-secondary/20 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
        </div>

        {/* Logo */}
        <div className="relative z-10 mb-8">
          <img src={logo} alt="Logo" className="h-20 w-auto animate-pulse" />
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold tracking-widest text-white mb-2">
            THE FOOD <span className="text-primary">BAR</span>
          </h2>
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.4em]">Preparing your experience</span>
            <span className="flex gap-1">
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="w-1 h-1 bg-primary rounded-full" />
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1 h-1 bg-primary rounded-full" />
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1 h-1 bg-primary rounded-full" />
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="h-full bg-gradient-to-r from-primary to-secondary"
        />
      </div>
    </div>
  );
}
