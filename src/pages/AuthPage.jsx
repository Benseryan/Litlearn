import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess]  = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') { await signIn(email, password); }
      else {
        await signUp(email, password, name);
        setSuccess('Check your email to confirm your account!');
      }
    } catch (err) { setError(err.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  const inp = "w-full bg-cream rounded-xl px-4 py-3 text-sm text-olive-dark placeholder:text-olive/40 border border-neutral_tone/50 focus:outline-none focus:border-sage transition-colors";

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 bg-olive-dark rounded-2xl flex items-center justify-center mb-4"
          style={{ boxShadow: '0 6px 0 #252611' }}>
          <BookOpen className="w-8 h-8 text-text_light" />
        </div>
        <h1 className="text-2xl font-semibold text-olive-dark">LitLearn</h1>
        <p className="text-sm text-olive/60 mt-1">Your literary journey starts here</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="w-full max-w-sm bg-cream-dark rounded-3xl p-6">
        <div className="flex gap-1 p-1 bg-cream rounded-2xl mb-6">
          {['login', 'signup'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === m ? 'bg-olive-dark text-text_light shadow-sm' : 'text-olive/70 hover:text-olive-dark'}`}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handle} className="space-y-3">
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <input type="text" placeholder="Full name" value={name}
                  onChange={(e) => setName(e.target.value)} className={inp} />
              </motion.div>
            )}
          </AnimatePresence>
          <input type="email" placeholder="Email address" value={email} required
            onChange={(e) => setEmail(e.target.value)} className={inp} />
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} required
              onChange={(e) => setPassword(e.target.value)} className={inp + ' pr-11'} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-olive/40 hover:text-olive-dark transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</motion.p>
          )}
          {success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-olive-dark bg-sage/30 rounded-xl px-4 py-3">{success}</motion.p>
          )}
          <button type="submit" disabled={loading}
            className="w-full h-12 bg-olive-dark text-text_light rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ boxShadow: '0 4px 0 #252611' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
