'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Lock, Star, ChevronRight, Cpu, Loader2, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ChallengePage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'challenge'));
        const fetchedChallenges = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setChallenges(fetchedChallenges);
      } catch (err) {
        console.error('Error fetching challenges:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const handleAcceptChallenge = (challenge: any) => {
    sessionStorage.setItem('activeChallenge', JSON.stringify(challenge));
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
            <Trophy size={16} />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Competency Matrix</span>
          </div>
          <h1 className="text-4xl font-mono font-bold tracking-tighter uppercase neon-text">Logic Challenges</h1>
          <p className="text-[var(--muted)] mt-2 text-sm">
            Prove your engineering skills by completing these digital logic puzzles.
          </p>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Loading Challenges...</span>
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-24 futuristic-glass rounded-2xl border-dashed">
              <Trophy size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">No challenges found, Please login if you've not yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {challenges.map((challenge, idx) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="futuristic-glass p-6 rounded-2xl flex flex-col group hover:border-[var(--accent)] transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {challenge.img ? (
                      <img src={challenge.img} alt={challenge.name} className="w-24 h-24 object-cover rounded-xl border border-[var(--border)]" />
                    ) : (
                      <div className="w-24 h-24 bg-[var(--border)] rounded-xl flex items-center justify-center text-[var(--muted)]">
                        <Cpu size={32} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent)]">{challenge.level || 'Unknown'}</span>
                      </div>
                      <h3 className="text-xl font-mono font-bold uppercase tracking-tight mb-2">{challenge.name}</h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-[var(--muted)] mb-6 flex-1 line-clamp-3">
                    {challenge.instructions}
                  </p>

                  <button 
                    onClick={() => handleAcceptChallenge(challenge)}
                    className="w-full bg-[var(--accent)] text-[var(--accent-fg)] p-3 rounded-xl text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    Accept Challenge
                    <Play size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
