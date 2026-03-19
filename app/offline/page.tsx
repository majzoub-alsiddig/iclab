'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, WifiOff, HardDrive, Download } from 'lucide-react';
import Link from 'next/link';
import { useBreadboard } from '@/hooks/use-breadboard';

export default function OfflinePage() {
  const { circuit } = useBreadboard();
  const [savedCircuits, setSavedCircuits] = useState<any[]>([]);

  useEffect(() => {
    // Load saved circuits from IndexedDB or localStorage
    const loadSavedCircuits = () => {
      try {
        const saved = localStorage.getItem('offline-circuits');
        if (saved) {
          setSavedCircuits(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to load saved circuits', e);
      }
    };
    
    loadSavedCircuits();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center gap-4 mb-6">
            <Cpu size={64} className="text-[var(--accent)] opacity-50" />
            <WifiOff size={64} className="text-[var(--muted)]" />
          </div>
          <h1 className="text-4xl font-mono font-bold tracking-tighter uppercase neon-text mb-4">
            You're Offline
          </h1>
          <p className="text-[var(--muted)] text-lg mb-8">
            Don't worry! You can still access your locally saved circuits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Continue with current circuit */}
          <div className="futuristic-glass p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                <HardDrive size={24} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-xl font-mono font-bold">Current Circuit</h2>
            </div>
            <p className="text-[var(--muted)] mb-6">
              Continue working on your current circuit. Changes will be saved locally.
            </p>
            <Link 
              href="/"
              className="block w-full text-center px-4 py-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl text-xs font-bold uppercase tracking-widest"
            >
              Return to Lab
            </Link>
          </div>

          {/* Saved circuits */}
          <div className="futuristic-glass p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                <Download size={24} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-xl font-mono font-bold">Saved Circuits</h2>
            </div>
            
            {savedCircuits.length > 0 ? (
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                {savedCircuits.map((circuit, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      // Load the saved circuit
                      sessionStorage.setItem('loadCircuit', JSON.stringify(circuit.data));
                      window.location.href = '/';
                    }}
                    className="w-full p-3 bg-[var(--border)] hover:bg-[var(--accent)]/10 rounded-xl text-left transition-all"
                  >
                    <div className="text-sm font-bold">{circuit.name}</div>
                    <div className="text-[10px] opacity-50">{circuit.date}</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[var(--muted)] text-sm mb-6">
                No saved circuits found. Save circuits while online to access them offline.
              </p>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 futuristic-glass/50 rounded-2xl">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Offline Features:</h3>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>✓ Continue working on your current circuit</li>
            <li>✓ Access previously saved circuits</li>
            <li>✓ Make changes and save locally</li>
            <li>✗ Cloud save/load requires internet</li>
            <li>✗ AI challenge verification requires internet</li>
            <li>✗ Samples registry requires internet</li>
          </ul>
        </div>
      </div>
    </div>
  );
}