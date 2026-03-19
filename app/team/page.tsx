'use client';

import React from 'react';
import { Users, Shield, Code, Bug } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function TeamPage() {
  const team = [
    { 
      id: 1, 
      name: 'Mohammed Saeed', 
      role: 'Founder', 
      icon: <Shield size={16} />, 
      img: '/assets/team/saeed.jpg', 
      contactUrl: 'https://linkedin.com/in/mohamed-saeed-9a81493b1'
    },
    { 
      id: 3, 
      name: 'Mohammed Mahjoub', 
      role: 'Tester', 
      icon: <Bug size={16} />, 
      img: '/assets/team/mahjoub.jpg',
      contactUrl: 'https://linkedin.com/in/mohammed-mahjoub-303449375'
    },
    { 
      id: 4, 
      name: 'Motwalli Babeker', 
      role: 'Tester', 
      icon: <Bug size={16} />, 
      img: '/assets/team/noimg.png',
      contactUrl: 'https://wa.me/+249909264804'
    },
    { 
      id: 5, 
      name: 'Mohammed Ebrahim', 
      role: 'Tester', 
      icon: <Bug size={16} />, 
      img: '/assets/team/noimg.png',
      contactUrl: 'https://wa.me/+249118285227'
    },
    { 
      id: 6, 
      name: 'Elbara Abdelkarim Elradi', 
      role: 'Tester', 
      icon: <Bug size={16} />, 
      img: '/assets/team/elbara.jpg',
      contactUrl: 'https://linkedin.com/in/elbara-abdelkarim-b86260239'
    },
    { 
      id: 2, 
      name: 'Majzoub AlSiddig', 
      role: 'Co-Founder & Developer',
      icon: <Code size={16} />, 
      img: '/assets/team/majzoub.jpg',
      contactUrl: 'https://linkedin.com/in/majzoub-siidig' 
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--accent)] mb-2">
            <Users size={16} />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Core Contributors</span>
          </div>
          <h1 className="text-4xl font-mono font-bold tracking-tighter uppercase neon-text">The Team</h1>
          <p className="text-[var(--muted)] mt-2 text-sm max-w-md mx-auto">
            Meet the engineers and testers behind the iclab digital logic system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, idx) => (
            <motion.a
              key={member.id}
              href={member.contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="futuristic-glass p-8 rounded-2xl flex flex-col items-center text-center group hover:border-[var(--accent)] transition-all cursor-pointer block"
            >
              <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-2 border-[var(--border)] group-hover:border-[var(--accent)] transition-colors shadow-xl">
                <Image 
                  src={member.img} 
                  alt={member.name} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              <h3 className="text-xl font-mono font-bold uppercase tracking-tight mb-2 group-hover:text-[var(--accent)] transition-colors">
                {member.name}
              </h3>
              
              <div className="flex items-center justify-center gap-2 text-[var(--muted)] group-hover:text-[var(--fg)] transition-colors">
                {member.icon}
                <span className="text-[10px] uppercase font-bold tracking-widest">{member.role}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
}