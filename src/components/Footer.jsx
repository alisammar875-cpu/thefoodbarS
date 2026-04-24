import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Camera,
  Send,
  Play
} from 'lucide-react';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img src={logo} alt="The Food Bar" className="h-10 w-auto max-h-[40px]" />
              <span className="text-2xl font-display font-bold tracking-wider text-white">
                THE FOOD <span className="text-primary">BAR</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Cravings Delivered. Fast.<br/>
              Premium street food for Karachi's hungriest.
            </p>
            <div className="flex gap-3">
              {[Camera, Globe, Send, Play].map((Icon, idx) => (
                <a key={idx} href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg mb-4 text-white">QUICK LINKS</h4>
            <ul className="space-y-2 text-sm">
              {[
                { name: 'Menu', path: '/menu' },
                { name: 'Reviews', path: '/reviews' },
                { name: 'Track Order', path: '/profile' },
                { name: 'My Account', path: '/profile' },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-text-muted hover:text-primary transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4 text-white">CONTACT US</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>📧 hello@thefoodbar.com</li>
              <li>📞 +92-300-0000000</li>
              <li>📍 Karachi, Pakistan</li>
              <li>🕐 11 AM — 3 AM Daily</li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div>
            <h4 className="font-display text-lg mb-4 text-white">HUNGRY?</h4>
            <p className="text-text-muted text-sm mb-4">Don't wait. Order now and get it delivered in 30 minutes.</p>
            <Link to="/menu" className="inline-block bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
              ORDER NOW →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
          <p>© 2025 The Food Bar. Crafted with 🔥 for food lovers in Karachi.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
