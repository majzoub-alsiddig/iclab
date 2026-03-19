'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Simulator = dynamic(() => import('@/components/Simulator'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#E4E3E0] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] uppercase font-bold tracking-widest opacity-50">Initializing Lab...</span>
      </div>
    </div>
  )
});

export default function Home() {
  return (
    <main className="min-h-screen pt-16">
      <Simulator />
    </main>
  );
}
