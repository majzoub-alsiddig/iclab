'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  Cpu, 
  LogIn, 
  LogOut, 
  FlaskConical, 
  LayoutGrid, 
  User, 
  Sun, 
  Moon, 
  Trophy,
  Menu,
  X,
  HelpCircle,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, userData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { name: 'Lab', href: '/', icon: <FlaskConical size={18} /> },
    { name: 'Samples', href: '/samples', icon: <LayoutGrid size={18} /> },
    { name: 'Help', href: '/help', icon: <HelpCircle size={18} /> },
    { name: 'Challenge', href: '/challenge', icon: <Trophy size={18} /> },
    // { name: 'Team', href: '/team', icon: <Users size={18} /> },
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 futuristic-glass border-b border-[var(--border)] px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-[var(--accent)] text-[var(--accent-fg)] rounded-lg group-hover:scale-110 transition-transform">
            <Cpu size={20} />
          </div>
          <span className="font-mono font-bold text-xl tracking-tighter text-blue-500 uppercase">iclab</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all relative group ${
                  pathname === item.href ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
                {pathname === item.href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-[var(--accent)] neon-glow"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="h-6 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-[var(--border)] rounded-full transition-colors text-[var(--muted)] hover:text-[var(--fg)]"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--border)] rounded-full">
                  <User size={14} className="text-[var(--accent)]" />
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[100px]">
                    {userData?.name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-bold uppercase tracking-widest rounded-lg hover:scale-105 transition-all neon-glow"
              >
                <LogIn size={16} />
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-[var(--muted)]">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-[var(--fg)]">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pb-4 space-y-4 border-t border-[var(--border)] pt-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 p-2 text-sm font-bold uppercase tracking-widest ${
                  pathname === item.href ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-[var(--border)]">
              {user ? (
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[var(--accent)]" />
                    <span className="text-xs font-bold uppercase">{userData?.name || user.email?.split('@')[0]}</span>
                  </div>
                  <button onClick={handleLogout} className="text-red-500 p-2">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full p-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-lg font-bold uppercase text-xs"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
