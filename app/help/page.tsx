'use client';

import React from 'react';
import { HelpCircle, FlaskConical, LayoutGrid, Trophy, Zap, Cpu, Play, Save, Download, Upload, Cloud } from 'lucide-react';
import { motion } from 'motion/react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
            <HelpCircle size={16} />
            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">System Documentation</span>
          </div>
          <h1 className="text-4xl font-mono font-bold tracking-tighter uppercase neon-text">User Manual</h1>
          <p className="text-[var(--muted)] mt-2 text-sm">
            Comprehensive guide to navigating and utilizing the iclab digital logic system.
          </p>
        </div>

        {/* Lab Page Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="futuristic-glass p-8 rounded-2xl space-y-6"
        >
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4">
            <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl">
              <FlaskConical size={24} />
            </div>
            <h2 className="text-2xl font-mono font-bold uppercase tracking-tight">The Lab (Simulator)</h2>
          </div>
          
          <div className="space-y-4 text-sm text-[var(--muted)]">
            <p>The Lab is your primary workspace for designing and testing digital logic circuits on a virtual breadboard.</p>
            
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg)] mt-6 mb-2">Basic Controls</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Note:</strong> You need to login to open full funcationality of the IC Lab.</li>
              <li><strong>Placing Wires:</strong> Click on any hole to start a wire, then click on another hole to connect them.</li>
              <li><strong>Deleting Wires:</strong> Click on an existing wire to select it, then click the red &quot;X&quot; button that appears on the wire to delete it.</li>
              <li><strong>Placing Components:</strong> Select a component from the toolbar (LED, Switch, Clock, or IC). For LEDs and Switches, click two different holes to place the two legs. For ICs, click a hole in the main center area to snap it across the middle divider.</li>
              <li><strong>Moving Components:</strong> Click and drag an IC to move it around the breadboard.</li>
              <li><strong>Component Properties:</strong> Click on a component to open the properties sidebar where you can label it or its pins.</li>
            </ul>

            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[var(--fg)] mt-6 mb-2">Toolbar Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-[var(--border)] rounded-xl">
                <Play size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-[var(--fg)] block text-xs uppercase mb-1">Run / Stop</strong>
                  <span>Starts or stops the logic simulation. Components like Clocks and LEDs only function while running.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[var(--border)] rounded-xl">
                <Zap size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-[var(--fg)] block text-xs uppercase mb-1">Switch (SW)</strong>
                  <span>A toggle switch. Click it while the simulation is running to open/close the circuit.</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[var(--border)] rounded-xl">
                <Cpu size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-[var(--fg)] block text-xs uppercase mb-1">Logic ICs</strong>
                  <span>Standard 7400-series logic chips (NAND, NOR, NOT, AND, OR, XOR, Counters, Flip-Flops). Ensure Pin 14 is connected to VCC (+) and Pin 7 to GND (-).</span>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[var(--border)] rounded-xl">
                <Save size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <strong className="text-[var(--fg)] block text-xs uppercase mb-1">Save / Load</strong>
                  <span>Save your circuit locally (.json) or to the Cloud (requires login). Cloud saves can be made Public for others to see.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Samples Page Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="futuristic-glass p-8 rounded-2xl space-y-6"
        >
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4">
            <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl">
              <LayoutGrid size={24} />
            </div>
            <h2 className="text-2xl font-mono font-bold uppercase tracking-tight">Samples Registry</h2>
          </div>
          
          <div className="space-y-4 text-sm text-[var(--muted)]">
            <p>The Samples page is a community-driven database of public circuits.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Browsing:</strong> View circuits created and made public by other engineers.</li>
              <li><strong>Searching:</strong> Use the search bar to find specific circuits by their name or the author&apos;s name.</li>
              <li><strong>Initializing:</strong> Click &quot;Initialize Circuit&quot; on any card to instantly load that design into your local Lab environment for inspection or modification.</li>
            </ul>
          </div>
        </motion.section>

        {/* Challenge Page Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="futuristic-glass p-8 rounded-2xl space-y-6"
        >
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-4">
            <div className="p-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl">
              <Trophy size={24} />
            </div>
            <h2 className="text-2xl font-mono font-bold uppercase tracking-tight">Logic Challenges</h2>
          </div>
          
          <div className="space-y-4 text-sm text-[var(--muted)]">
            <p>Test your engineering skills by completing predefined digital logic puzzles.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Accepting a Challenge:</strong> Browse available challenges and click &quot;Accept Challenge&quot;. This will redirect you to the Lab with the challenge active.</li>
              <li><strong>Challenge HUD:</strong> In the Lab, a special panel will appear at the top showing your objective and instructions. You can minimize this panel to save space.</li>
              <li><strong>Building the Solution:</strong> Use the breadboard to construct a circuit that meets the requirements described in the instructions.</li>
              <li><strong>AI Verification:</strong> Once you believe your circuit is correct, click &quot;Check Solution&quot;. Our AI instructor will analyze your wiring and logic against the expected solution and provide immediate feedback on whether you passed or failed.</li>
              <li><strong>Aborting:</strong> If you want to stop the challenge, click the &quot;Abort&quot; button in the Challenge HUD.</li>
            </ul>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
