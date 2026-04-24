import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { signup, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return addToast('Passwords do not match.', 'error');
    if (formData.password.length < 6) return addToast('Password must be at least 6 characters.', 'error');
    if (!agreed) return addToast('Please agree to the terms.', 'error');

    setLoading(true);
    try {
      await signup(formData.email, formData.password, formData.name, formData.phone);
      addToast('Account created! Welcome aboard 🎉', 'success');
      navigate(redirect);
    } catch (error) {
      addToast(error.message.includes('auth/email-already-in-use') ? 'Email already registered.' : error.message, 'error');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      addToast('Signed in with Google!', 'success');
      navigate(redirect);
    } catch {
      addToast('Google sign-up failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Image Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent z-10" />
        <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80" alt="Pizza" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute bottom-20 left-12 z-20 max-w-md">
          <span className="text-secondary font-accent text-sm tracking-widest uppercase mb-4 block">New Here?</span>
          <h1 className="text-7xl font-display text-white mb-4 leading-none">
            JOIN THE<br/><span className="text-secondary">FOOD FAM.</span>
          </h1>
          <p className="text-lg text-white/70">Create an account to save addresses, earn loyalty points, and reorder in one click.</p>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="mb-8">
            <Link to="/" className="text-2xl font-display tracking-wider text-white lg:hidden block mb-8">
              THE FOOD <span className="text-primary">BAR</span>
            </Link>
            <h2 className="text-4xl font-display mb-2">CREATE ACCOUNT</h2>
            <p className="text-text-muted">Start ordering in under 60 seconds.</p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-3.5 bg-white text-gray-800 rounded-xl font-bold tracking-wide hover:bg-gray-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-text-muted text-xs uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="Muhammad Ali" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Email Address *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" placeholder="you@example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Password *</label>
                <div className="relative">
                  <input required type={showPass ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="input-field pr-12" placeholder="••••••" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">Confirm *</label>
                <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input-field" placeholder="••••••" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1.5">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="0300 1234567" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-text-muted">I agree to the <span className="text-white">Terms & Conditions</span></span>
            </label>

            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold tracking-wide hover:opacity-90 transition-all disabled:opacity-70 mt-2"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </motion.button>

            <p className="text-center text-text-muted mt-4">
              Already have an account? <Link to={`/login?redirect=${redirect}`} className="text-white hover:text-primary transition-colors font-bold">Sign in</Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
