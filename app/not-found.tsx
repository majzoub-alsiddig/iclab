'use client';

import Link from 'next/link';
import { Cpu, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <Cpu size={64} className="text-[var(--accent)] opacity-50" />
        </div>
        <h1 className="text-6xl font-mono font-bold text-[var(--accent)]">404</h1>
        <h2 className="text-2xl font-mono font-bold uppercase tracking-tight">Page Not Found</h2>
        <p className="text-[var(--muted)]">
          The circuit you're looking for doesn't exist or has been disconnected.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all"
        >
          <Home size={16} />
          Return to Lab
        </Link>
      </div>
    </div>
  );
}