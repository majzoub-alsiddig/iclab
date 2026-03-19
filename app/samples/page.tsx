'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, User, Calendar, ArrowRight, Loader2, Globe, Search, FlaskConical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBreadboard } from '@/hooks/use-breadboard';

export default function SamplesPage() {
  const [samples, setSamples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { setCircuit, reset } = useBreadboard();

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        // Fetch all users to find public circuits in their 'circuits' object
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const allPublicCircuits: any[] = [];

        usersSnapshot.forEach((userDoc) => {
          const userData = userDoc.data();
          const circuits = userData.circuits || {};
          
          Object.entries(circuits).forEach(([id, circuit]: [string, any]) => {
            if (circuit.isPublic) {
              allPublicCircuits.push({
                id,
                ...circuit,
                // Ensure compatibility with the UI
                data: circuit.circuitData,
                createdAt: circuit.timeAdded ? new Date(circuit.timeAdded) : new Date(),
              });
            }
          });
        });

        // Sort by date descending
        allPublicCircuits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setSamples(allPublicCircuits);
      } catch (err) {
        console.error('Error fetching samples:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSamples();
  }, []);

  const handleLoadSample = (sampleData: any) => {
    // Save to session storage so Simulator can pick it up
    sessionStorage.setItem('loadCircuit', JSON.stringify(sampleData));
    router.push('/');
  };

  const filteredSamples = samples.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.authorName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
              <Globe size={16} />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Global Archives</span>
            </div>
            <h1 className="text-4xl font-mono font-bold tracking-tighter uppercase neon-text">Public Registry</h1>
            <p className="text-[var(--muted)] mt-2 max-w-md text-sm">
              Explore digital logic circuits designed and shared by the iclab community.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circuits or authors..."
              className="w-full bg-[var(--border)] border border-transparent p-3 pl-10 text-sm rounded-xl focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Syncing with mainframe...</span>
          </div>
        ) : filteredSamples.length === 0 ? (
          <div className="text-center py-24 futuristic-glass rounded-2xl border-dashed">
            <Cpu size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">No matching archives found, Please login or change searching terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSamples.map((sample, idx) => (
              <motion.div
                key={sample.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="futuristic-glass p-6 rounded-2xl group hover:border-[var(--accent)] transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-[var(--accent)]/10 rounded-lg text-[var(--accent)]">
                    <FlaskConical size={20} />
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[8px] uppercase font-bold text-[var(--muted)]">
                    <div className="flex items-center gap-1">
                      <Calendar size={10} />
                      {sample.createdAt.toLocaleDateString()}
                    </div>
                    <div className="opacity-50">
                      {sample.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-mono font-bold uppercase tracking-tight mb-2 group-hover:text-[var(--accent)] transition-colors">
                  {sample.name}
                </h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-[var(--border)] border border-[var(--accent)]/20 text-[var(--accent)] rounded-full flex items-center justify-center text-[10px] font-bold">
                    {sample.authorName?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-bold tracking-widest text-[var(--muted)] opacity-50">Designer</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg)]">
                      {sample.authorName || 'Anonymous Author'}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-[var(--border)]">
                  <button 
                    onClick={() => handleLoadSample(sample.data)}
                    className="flex items-center justify-between w-full text-[10px] uppercase font-bold tracking-widest text-[var(--accent)] group-hover:translate-x-1 transition-transform"
                  >
                    Initialize Circuit
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
