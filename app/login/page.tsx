'use client';

import React, { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Mail, Lock, ArrowRight, Loader2, AlertCircle, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await setPersistence(auth, browserLocalPersistence);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user data with name
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          uid: user.uid,
          createdAt: new Date().toISOString(),
          circuits: {},
        });
      }
      router.push('/');
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 pt-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md futuristic-glass p-8 rounded-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl mb-4 neon-glow">
            <Cpu size={32} />
          </div>
          <h1 className="text-2xl font-mono font-bold tracking-tighter uppercase neon-text">
            {isLogin ? 'Access Terminal' : 'Initialize Account'}
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)] mt-2">
            iclab digital logic system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--muted)] ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--border)] border border-transparent p-3 pl-10 text-sm focus:outline-none focus:border-[var(--accent)] transition-all rounded-xl"
                  placeholder="Nikola Tesla"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[var(--muted)] ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--border)] border border-transparent p-3 pl-10 text-sm focus:outline-none focus:border-[var(--accent)] transition-all rounded-xl"
                placeholder="engineer@iclab.tech"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[var(--muted)] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--border)] border border-transparent p-3 pl-10 text-sm focus:outline-none focus:border-[var(--accent)] transition-all rounded-xl"
                placeholder="••••••••"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-red-500 text-[10px] uppercase font-bold bg-red-500/10 p-3 border border-red-500/20 rounded-xl"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-[var(--accent-fg)] p-4 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 rounded-xl neon-glow"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {isLogin ? 'Authenticate' : 'Initialize'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            {isLogin ? "New user? Create account" : "Existing user? Authenticate"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)] opacity-50 hover:opacity-100 transition-opacity">
            Return to Lab
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
