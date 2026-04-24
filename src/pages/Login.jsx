import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);

  const { login, loginWithGoogle, resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back!', 'success');
      navigate(redirect);
    } catch (error) {
      addToast(error.message.includes('auth/') ? 'Invalid email or password.' : error.message, 'error');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      addToast('Signed in with Google!', 'success');
      navigate(redirect);
    } catch (error) {
      addToast('Google sign-in failed.', 'error');
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) return addToast('Enter your email address.', 'error');
    try {
      await resetPassword(resetEmail);
      addToast('Reset email sent! Check your inbox.', 'success');
      setShowReset(false);
    } catch {
      addToast('Could not send reset email. Check the address.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Image Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-transparent z-10" />
        <img src="https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=1000&q=80" alt="Food" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute bottom-20 left-12 z-20 max-w-md">
          <span className="text-primary font-accent text-sm tracking-widest uppercase mb-4 block">Welcome Back</span>
          <h1 className="text-7xl font-display text-white mb-4 leading-none">
            HUNGER<br/><span className="text-primary">STOPS HERE.</span>
          </h1>
          <p className="text-lg text-white/70">Sign in to access saved addresses, track orders, and earn loyalty points.</p>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0A0A0A]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="mb-10">
            <Link to="/" className="text-2xl font-display tracking-wider text-white lg:hidden block mb-8">
              THE FOOD <span className="text-primary">BAR</span>
            </Link>
            <h2 className="text-4xl font-display mb-2">LOGIN</h2>
            <p className="text-text-muted">Enter your credentials to continue.</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Email Address</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text-muted">Password</label>
                <button type="button" onClick={() => { setResetEmail(email); setShowReset(true); }} className="text-xs text-primary hover:underline">Forgot Password?</button>
              </div>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold tracking-wide hover:opacity-90 transition-all disabled:opacity-70"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </motion.button>

            <p className="text-center text-text-muted mt-6">
              Don't have an account? <Link to={`/signup?redirect=${redirect}`} className="text-white hover:text-primary transition-colors font-bold">Sign up here</Link>
            </p>
          </form>

          {/* Forgot Password Modal */}
          {showReset && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowReset(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={e => e.stopPropagation()} className="glass-card p-8 max-w-sm w-full">
                <h3 className="text-2xl font-display mb-4">RESET PASSWORD</h3>
                <p className="text-text-muted text-sm mb-6">Enter your email and we'll send a reset link.</p>
                <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="input-field mb-4" placeholder="you@example.com" />
                <button onClick={handleForgotPassword} className="w-full py-3 bg-primary text-white rounded-xl font-bold">SEND RESET LINK</button>
                <button onClick={() => setShowReset(false)} className="w-full py-3 mt-2 text-text-muted hover:text-white">Cancel</button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
