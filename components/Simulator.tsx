'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Stage, Layer, Circle, Line, Rect, Text, Group } from 'react-konva';
import { useBreadboard } from '../hooks/use-breadboard';
import { calculateNets } from '../lib/connectivity';
import { IC_DEFINITIONS } from '../lib/simulation-engine';
import { LogicLevel, ComponentInstance } from '../lib/circuit-types';
import { Cpu, Zap, Lightbulb, Trash2, Play, Square, RotateCcw, Plus, Minus, Maximize, Download, Upload, Cloud, X, Lock, Globe, FolderOpen, Save, HardDrive,Settings,ChevronRight,Info,Loader2, CheckCircle2, Minimize2, Maximize2, AlertTriangle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useTheme } from '@/hooks/use-theme';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY });

export default function Simulator() {
  const { holes, circuit, addWire, addComponent, setCircuit, undo, reset } = useBreadboard();
  const [selectedHole, setSelectedHole] = useState<string | null>(null);
  const [hoveredHole, setHoveredHole] = useState<string | null>(null);
  const [netStates, setNetStates] = useState<Map<string, LogicLevel>>(new Map());
  const netStatesRef = useRef(netStates);
  const icStatesRef = useRef(new Map<string, any>());
  const [isRunning, setIsRunning] = useState(false);
  const [activeComponentType, setActiveComponentType] = useState<ComponentInstance['type'] | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [icStates, setIcStates] = useState<Map<string, any>>(new Map());
  const [clockTick, setClockTick] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [previewICPosition, setPreviewICPosition] = useState<{row: number, col: number, type: 'main'} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, userData } = useAuth();
  const { theme } = useTheme();
  const [showCloudSave, setShowCloudSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showCloudLoad, setShowCloudLoad] = useState(false);
  const [userCircuits, setUserCircuits] = useState<any[]>([]);
  const [isLoadingCircuits, setIsLoadingCircuits] = useState(false);
  
  // Challenge State
  const [activeChallenge, setActiveChallenge] = useState<any | null>(null);
  const [challengeCollapsed, setChallengeCollapsed] = useState(false);
  const [isCheckingChallenge, setIsCheckingChallenge] = useState(false);
  const [challengeResult, setChallengeResult] = useState<{status: 'pass' | 'fail', message: string} | null>(null);

  useEffect(() => {
    const loadCircuit = sessionStorage.getItem('loadCircuit');
    if (loadCircuit) {
      try {
        const data = JSON.parse(loadCircuit);
        setCircuit(data);
        setNetStates(new Map());
        setIcStates(new Map());
        icStatesRef.current = new Map();
        netStatesRef.current = new Map();
        sessionStorage.removeItem('loadCircuit');
      } catch (e) {
        console.error('Failed to load circuit from session storage', e);
      }
    }
  }, [setCircuit]);

  useEffect(() => {
    const loadCircuit = sessionStorage.getItem('loadCircuit');
    if (loadCircuit) {
      try {
        const data = JSON.parse(loadCircuit);
        setCircuit(data);
        setNetStates(new Map());
        setIcStates(new Map());
        icStatesRef.current = new Map();
        netStatesRef.current = new Map();
        sessionStorage.removeItem('loadCircuit');
      } catch (e) {
        console.error('Failed to load circuit from session storage', e);
      }
    }
  }, [setCircuit]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  const resetView = () => {
    setZoom(1);
    if (stageRef.current) {
      stageRef.current.position({ x: 0, y: 0 });
      stageRef.current.batchDraw();
    }
  };
  useEffect(() => {
    const activeCh = sessionStorage.getItem('activeChallenge');
    if (activeCh) {
      try {
        setActiveChallenge(JSON.parse(activeCh));
      } catch (e) {
        console.error('Failed to load active challenge', e);
      }
    }
  }, []);

  const handleAbortChallenge = () => {
    sessionStorage.removeItem('activeChallenge');
    setActiveChallenge(null);
    setChallengeResult(null);
  };

  const handleCheckChallenge = async () => {
    if (!activeChallenge) return;
    setIsCheckingChallenge(true);
    setChallengeResult(null);

    try {
      const prompt = `
        You are an expert digital electronics judge specialized in breadboard circuit validation.

        The user is attempting this challenge:
        Name: "${activeChallenge.name}"
        Instructions: "${activeChallenge.instructions}"

        ========================
        CRITICAL BREADBOARD RULES
        ========================
        You MUST interpret the circuit using REAL breadboard connectivity rules, NOT physical positions:

        1. MAIN AREA CONNECTIONS:
        - Each column has 2 separate groups:
          • Rows 0–4 (top half) → ALL 5 holes are internally connected
          • Rows 5–9 (bottom half) → ALL 5 holes are internally connected
        - There is NO connection across the center gap

        2. POWER RAILS:
        - The 0 & 3 rail is + while the 1 & 2 rails are -
        - The "rail-a-b" mean the (a) sign (+ for 0 & 3 and - for 1 & 2) and b means the row number (row number makes to difference) 
        - Each rail row is horizontally connected across all columns
        - Rails are independent unless connected by wires

        3. WIRES:
        - Any wire connects TWO holes electrically (same node / net)

        5. IMPORTANT:
        - Holes that are electrically connected (via rules above) are the SAME NODE
        - You MUST reason using electrical connectivity (nets), NOT coordinates
        - LEDs in this lab do not have any Polarity

        ========================
        IC (CHIP) UNDERSTANDING
        ========================
        - IC pins are independent unless defined by the IC logic
        - Each pin connects ONLY to the hole it is placed in
        - You MUST evaluate:
          • Power pins (VCC / GND)
          • Input/output relationships
          • Logical correctness (not just wiring)

        ========================
        EVALUATION STRATEGY
        ========================
        You MUST follow this process:

        1. Convert BOTH circuits into ELECTRICAL NETS:
          - Group all connected holes into nodes

        2. Map components to those nets:
          - Determine which pins share the same electrical node

        3. Compare LOGICAL BEHAVIOR, not layout:
          - Ignore physical placement differences
          - Focus on:
            ✔ Correct connections
            ✔ Correct power wiring
            ✔ Correct signal flow
            ✔ Correct logic function

        4. Be tolerant:
          - Different placement is OK
          - Different wire paths are OK
          - Electrically equivalent = CORRECT

        5. Fail ONLY if:
          - Missing/incorrect connections
          - Wrong logic behavior
          - Floating or shorted critical pins
          - Incorrect power connections

        ========================
        INPUT DATA
        ========================

        EXPECTED SOLUTION:
        ${JSON.stringify(activeChallenge.solution)}

        USER CIRCUIT:
        ${JSON.stringify(circuit)}

        ========================
        OUTPUT FORMAT (STRICT)
        ========================
        Return ONLY valid JSON:

        {
          "status": "pass" | "fail",
          "message": "Clear explanation. If fail, explain EXACTLY what is wrong electrically and how to fix it in simple small message."
        }

        ========================
        IMPORTANT
        ========================
        - DO NOT compare hole positions directly
        - ALWAYS reason using connectivity (nets)
        - ALWAYS think like real circuit analysis
        - Be precise and educational in feedback
        `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const resultText = response.text;
      if (resultText) {
        const result = JSON.parse(resultText);
        setChallengeResult(result);
      } else {
        throw new Error("No response from AI");
      }
    } catch (err) {
      console.error("Error checking challenge:", err);
      setChallengeResult({
        status: 'fail',
        message: 'An error occurred while checking your solution. Please try again.'
      });
    } finally {
      setIsCheckingChallenge(false);
    }
  };

  const { nets, find } = useMemo(() => calculateNets(holes, circuit), [holes, circuit]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveComponentType(null);
        setActiveModel(null);
        setSelectedHole(null);
        setPreviewICPosition(null);
        setSelectedComponentId(null);
        setSelectedWireId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  // Clock generator
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setClockTick(prev => prev + 1);
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning]);
  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const newNetStates = new Map<string, LogicLevel>(netStatesRef.current);
      const newIcStates = new Map<string, any>(icStatesRef.current);
      holes.forEach(h => {
        if (h.type === 'rail') {
          const root = find(h.id);
          if (h.railType === 'VCC') newNetStates.set(root, 'HIGH');
          if (h.railType === 'GND') newNetStates.set(root, 'LOW');
        }
      });
      circuit.components.forEach(comp => {
        if (comp.type === 'CLOCK') {
          const holeId = `${comp.position.type}-${comp.position.row}-${comp.position.col}`;
          const root = find(holeId);
          newNetStates.set(root, clockTick % 2 === 0 ? 'HIGH' : 'LOW');
        }
      });
      for (let i = 0; i < 5; i++) {
        circuit.components.forEach(comp => {
          if (comp.type === 'IC' && comp.model) {
            const def = IC_DEFINITIONS[comp.model];
            if (!def) return;
            let hasPower = false;
            const vccPin = def.pins.find(p => p.type === 'vcc');
            const gndPin = def.pins.find(p => p.type === 'gnd');
            
            if (vccPin && gndPin) {
              const getPinState = (pinNum: number) => {
                const isBottomRow = pinNum <= 7;
                const pinRow = isBottomRow ? comp.position.row + 1 : comp.position.row;
                const pinCol = isBottomRow ? comp.position.col + (pinNum - 1) : comp.position.col + (14 - pinNum);
                const holeId = `${comp.position.type}-${pinRow}-${pinCol}`;
                const root = find(holeId);
                return newNetStates.get(root) || 'FLOATING';
              };
              
              if (getPinState(vccPin.number) === 'HIGH' && getPinState(gndPin.number) === 'LOW') {
                hasPower = true;
              }
            }
            if (!hasPower) {
              def.pins.forEach(pin => {
                if (pin.type === 'output') {
                  const isBottomRow = pin.number <= 7;
                  const pinRow = isBottomRow ? comp.position.row + 1 : comp.position.row;
                  const pinCol = isBottomRow ? comp.position.col + (pin.number - 1) : comp.position.col + (14 - pin.number);
                  const holeId = `${comp.position.type}-${pinRow}-${pinCol}`;
                  const root = find(holeId);
                  newNetStates.set(root, 'FLOATING');
                }
              });
              return;
            }
            const gates = new Map<number, { inputs: LogicLevel[], outputPins: number[] }>();
            def.pins.forEach(pin => {
              if (pin.gateId !== undefined) {
                if (!gates.has(pin.gateId)) gates.set(pin.gateId, { inputs: [], outputPins: [] });
                const gate = gates.get(pin.gateId)!;
                
                const isBottomRow = pin.number <= 7;
                const pinRow = isBottomRow ? comp.position.row + 1 : comp.position.row;
                const pinCol = isBottomRow ? comp.position.col + (pin.number - 1) : comp.position.col + (14 - pin.number);
                
                const holeId = `${comp.position.type}-${pinRow}-${pinCol}`;
                const root = find(holeId);
                const state = newNetStates.get(root) || 'FLOATING';
                if (pin.type === 'input') gate.inputs.push(state);
                if (pin.type === 'output') gate.outputPins.push(pin.number);
              }
            });
            gates.forEach((gate, gateId) => {
              if (gate.outputPins.length > 0) {
                const stateKey = `${comp.id}-${gateId}`;
                const { output, newState } = def.logic(gate.inputs, newIcStates.get(stateKey));
                
                if (newState !== undefined) {
                  newIcStates.set(stateKey, newState);
                }
                gate.outputPins.forEach((pinNum, idx) => {
                  const outputLevel = Array.isArray(output) ? output[idx] : output;
                  const isBottomRow = pinNum <= 7;
                  const pinRow = isBottomRow ? comp.position.row + 1 : comp.position.row;
                  const pinCol = isBottomRow ? comp.position.col + (pinNum - 1) : comp.position.col + (14 - pinNum);
                  
                  const holeId = `${comp.position.type}-${pinRow}-${pinCol}`;
                  const root = find(holeId);
                  newNetStates.set(root, outputLevel);
                });
              }
            });
          }
        });
      }
      icStatesRef.current = newIcStates;
      setNetStates(newNetStates);
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, circuit, holes, find, clockTick]);
  const handleHoleClick = (holeId: string) => {
    const h = holes.find(x => x.id === holeId);
    if (!h) return;
    if (activeComponentType) {
      if (activeComponentType === 'LED' || activeComponentType === 'SWITCH' || activeComponentType === 'CLOCK') {
        if (activeComponentType === 'CLOCK') {
          addComponent(activeComponentType, undefined, { row: h.row, col: h.col, type: h.type });
          setActiveComponentType(null);
          return;
        }
        if (!selectedHole) {
          setSelectedHole(holeId);
        } else {
          const h1 = holes.find(x => x.id === selectedHole);
          if (h1) {
            addComponent(
              activeComponentType, 
              undefined, 
              { row: h1.row, col: h1.col, type: h1.type },
              { row: h.row, col: h.col, type: h.type }
            );
          }
          setSelectedHole(null);
          setActiveComponentType(null);
        }
      } else if (h.type === 'main') {
        if (activeComponentType === 'IC') {
          setPreviewICPosition({ row: h.row, col: h.col, type: 'main' });
        } else {
          addComponent(activeComponentType, activeModel || undefined, { row: h.row, col: h.col, type: 'main' });
          setActiveComponentType(null);
          setActiveModel(null);
        }
      }
      return;
    }
    if (selectedHole) {
      if (selectedHole !== holeId) {
        addWire(selectedHole, holeId);
      }
      setSelectedHole(null);
    } else {
      setSelectedHole(holeId);
    }
  };
  const resetCircuit = () => {
    reset();
    setNetStates(new Map());
  };
  const confirmReset = () => {
    if (window.confirm("Are you sure you want to clear the breadboard? This cannot be undone.")) {
      resetCircuit();
    }
  };
  const saveCircuitLocal = () => {
    const data = JSON.stringify(circuit, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `circuit-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowCloudSave(false);
  };
  const loadCircuitLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        setCircuit(data);
        setNetStates(new Map());
        setIcStates(new Map());
        icStatesRef.current = new Map();
        netStatesRef.current = new Map();
        alert('Circuit loaded successfully!');
      } catch (err) {
        alert('Error loading circuit');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleCloudSave = async () => {
    if (!user) {
      alert('Please login to save circuits to the cloud.');
      return;
    }
    if (!saveName.trim()) {
      alert('Please enter a name for your circuit.');
      return;
    }
    setIsSaving(true);
    try {
      const sanitize = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(sanitize);
        if (obj !== null && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj)
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => [k, sanitize(v)])
          );
        }
        return obj;
      };
      const sanitizedCircuit = sanitize(circuit);
      
      const circuitId = Math.random().toString(36).substring(7);
      const authorName = userData?.name || user.email?.split('@')[0];
      const timeAdded = new Date().toISOString();

      const circuitEntry = {
        name: saveName,
        authorName: authorName,
        timeAdded: timeAdded,
        circuitData: sanitizedCircuit,
        isPublic: isPublic,
        userId: user.uid
      };

      // Update user document with the new circuit in the 'circuits' object
      await updateDoc(doc(db, 'users', user.uid), {
        [`circuits.${circuitId}`]: circuitEntry
      });
      
      if (isPublic) {
        await addDoc(collection(db, 'circuits'), {
          ...circuitEntry,
          createdAt: serverTimestamp(),
        });
      }
      alert('Circuit saved to cloud successfully!');
      setShowCloudSave(false);
      setSaveName('');
    } catch (err) {
      console.error('Cloud save error:', err);
      alert('Error saving to cloud');
    } finally {
      setIsSaving(false);
    }
  };
  const fetchUserCircuits = React.useCallback(async () => {
    if (!user) return;
    setIsLoadingCircuits(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const circuitsObj = data.circuits || {};
        const circuitsList = Object.entries(circuitsObj).map(([id, circuit]: [string, any]) => ({
          id,
          ...circuit,
          data: circuit.circuitData, // Map circuitData to data for compatibility with handleCloudLoad
          createdAt: { seconds: new Date(circuit.timeAdded).getTime() / 1000 } // Mock timestamp for UI
        })).sort((a, b) => new Date(b.timeAdded).getTime() - new Date(a.timeAdded).getTime());
        
        setUserCircuits(circuitsList);
      }
    } catch (err) {
      console.error('Error fetching circuits:', err);
    } finally {
      setIsLoadingCircuits(false);
    }
  }, [user]);
  useEffect(() => {
    if (showCloudLoad) {
      fetchUserCircuits();
    }
  }, [showCloudLoad, fetchUserCircuits]);
  const handleCloudLoad = (circuitData: any) => {
    try {
      setCircuit(circuitData);
      setNetStates(new Map());
      setIcStates(new Map());
      icStatesRef.current = new Map();
      netStatesRef.current = new Map();
      setShowCloudLoad(false);
      alert('Circuit loaded from cloud!');
    } catch (err) {
      alert('Error loading circuit from cloud');
    }
  };
  const selectedComponent = useMemo(() => 
    circuit.components.find(c => c.id === selectedComponentId), 
    [circuit.components, selectedComponentId]
  );
  const updateComponentLabel = (id: string, label: string) => {
    setCircuit(prev => ({
      ...prev,
      components: prev.components.map(c => c.id === id ? { ...c, label } : c)
    }));
  };
  const updatePinLabel = (compId: string, pinNum: number, label: string) => {
    setCircuit(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (c.id !== compId) return c;
        const labels = { ...(c.labels || {}), [pinNum]: label };
        return { ...c, labels };
      })
    }));
  };
  return (
    <div className="relative w-full h-screen bg-[var(--bg)] font-sans text-[var(--fg)] overflow-hidden flex flex-col">
      
      {/* Challenge UI */}
      {activeChallenge && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="futuristic-glass rounded-2xl shadow-2xl border border-[var(--accent)]/30 overflow-hidden"
          >
            <div className="bg-[var(--accent)]/10 p-3 flex items-center justify-between border-b border-[var(--accent)]/20">
              <div className="flex items-center gap-3">
                <Trophy size={18} className="text-[var(--accent)]" />
                <h3 className="font-mono font-bold uppercase text-sm tracking-tight">{activeChallenge.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setChallengeCollapsed(!challengeCollapsed)} className="p-1.5 hover:bg-[var(--border)] rounded-lg text-[var(--muted)] transition-colors">
                  {challengeCollapsed ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {!challengeCollapsed && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 flex flex-col md:flex-row gap-4">
                    {activeChallenge.img && (
                      <img src={activeChallenge.img} alt="Challenge" className="w-full md:w-32 h-32 object-cover rounded-xl border border-[var(--border)]" />
                    )}
                    <div className="flex-1 flex flex-col">
                      <p className="text-sm text-[var(--muted)] mb-4 flex-1">{activeChallenge.instructions}</p>
                      
                      {challengeResult && (
                        <div className={`p-3 rounded-xl mb-4 text-xs font-bold border ${challengeResult.status === 'pass' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            {challengeResult.status === 'pass' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                            <span className="uppercase tracking-widest">{challengeResult.status === 'pass' ? 'Challenge Passed!' : 'Needs Work'}</span>
                          </div>
                          <p className="opacity-80 font-normal">{challengeResult.message}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-auto">
                        <button 
                          onClick={handleAbortChallenge}
                          className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-[var(--border)] hover:bg-red-500/20 hover:text-red-500 transition-all flex-1 md:flex-none"
                        >
                          Abort
                        </button>
                        <button 
                          onClick={handleCheckChallenge}
                          disabled={isCheckingChallenge}
                          className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-all flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isCheckingChallenge ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          {isCheckingChallenge ? 'Checking...' : 'Check Solution'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Main Stage Area */}
      <div ref={containerRef} className="flex-1 h-full cursor-crosshair relative bg-[#D4D3D0]">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          ref={stageRef}
          draggable
          onClick={() => {
            setSelectedComponentId(null);
            setSelectedWireId(null);
          }}
          onTap={() => {
            setSelectedComponentId(null);
            setSelectedWireId(null);
          }}
        >
          <Layer
            rotation={isMobile ? 90 : 0}
            x={stageSize.width / 2}
            y={stageSize.height / 2 + (isMobile ? 40 : 0)}
            scaleX={(() => {
              const breadboardWidth = 540;
              const breadboardHeight = 370;
              if (isMobile) {
                return (stageSize.width / breadboardHeight) * 0.85 * zoom;
              } else {
                return Math.min(stageSize.width / breadboardWidth, stageSize.height / breadboardHeight) * 0.9 * zoom;
              }
            })()}
            scaleY={(() => {
              const breadboardWidth = 540;
              const breadboardHeight = 370;
              if (isMobile) {
                return (stageSize.width / breadboardHeight) * 0.85 * zoom;
              } else {
                return Math.min(stageSize.width / breadboardWidth, stageSize.height / breadboardHeight) * 0.9 * zoom;
              }
            })()}
            offsetX={280}
            offsetY={195}
          >
            {/* Breadboard Base */}
            <Rect 
              x={10} y={10} width={540} height={370} 
              fill="#F5F5F3" stroke="#141414" strokeWidth={1} 
              cornerRadius={10}
            />
            {/* Power Rail Lines */}
            <Line points={[40, 40, 504, 40]} stroke="#FF4444" strokeWidth={2} opacity={0.5} />
            <Line points={[40, 60, 504, 60]} stroke="#4444FF" strokeWidth={2} opacity={0.5} />
            <Line points={[40, 320, 504, 320]} stroke="#4444FF" strokeWidth={2} opacity={0.5} />
            <Line points={[40, 340, 504, 340]} stroke="#FF4444" strokeWidth={2} opacity={0.5} />
            
            {/* Labels for rails */}
            <Text x={25} y={35} text="+" fill="#FF4444" fontSize={14} fontStyle="bold" />
            <Text x={25} y={55} text="-" fill="#4444FF" fontSize={14} fontStyle="bold" />
            <Text x={25} y={315} text="-" fill="#4444FF" fontSize={14} fontStyle="bold" />
            <Text x={25} y={335} text="+" fill="#FF4444" fontSize={14} fontStyle="bold" />
            
            {/* The sperators lines */}
            <Line points={[30, 71, 514, 71]} stroke="#000000" strokeWidth={8} opacity={0.6}/>
            <Line points={[33, 71, 511, 71]} stroke="#ffffff" strokeWidth={3} opacity={0.9}/>
            <Line points={[30, 190, 514, 190]} stroke="#000000" strokeWidth={8} opacity={0.6}/>
            <Line points={[33, 190, 511, 190]} stroke="#ffffff" strokeWidth={4.5} opacity={0.9}/>
            <Line points={[30, 309, 514, 309]} stroke="#000000" strokeWidth={8} opacity={0.6}/>
            <Line points={[33, 309, 511, 309]} stroke="#ffffff" strokeWidth={3} opacity={0.9}/>
            

            {/* Holes */}
            {holes.map(h => {
              const root = find(h.id);
              const state = netStates.get(root) || 'FLOATING';
              const isSelected = selectedHole === h.id;
              const isHovered = hoveredHole === h.id;
              
              let holeColor = '#E4E3E0';
              if (state === 'HIGH') holeColor = '#FF4444';
              if (state === 'LOW') holeColor = '#4444FF';
              if (isSelected) holeColor = '#141414';
              
              return (
                <Circle
                  key={h.id}
                  x={h.x}
                  y={h.y}
                  radius={isHovered ? 7 : 5}
                  fill={holeColor}
                  stroke="#141414"
                  strokeWidth={0.5}
                  hitStrokeWidth={12}
                  onClick={() => handleHoleClick(h.id)}
                  onTap={() => handleHoleClick(h.id)}
                  onMouseEnter={() => setHoveredHole(h.id)}
                  onMouseLeave={() => setHoveredHole(null)}
                />
              );
            })}
            {/* IC Placement Preview */}
            {activeComponentType === 'IC' && previewICPosition && (
              <Group>
                {/* Draw 14 green dots */}
                {Array.from({ length: 14 }).map((_, i) => {
                  const pinNum = i + 1;
                  const isBottomRow = pinNum <= 7;
                  const pinRow = isBottomRow ? previewICPosition.row + 1 : previewICPosition.row;
                  const pinCol = isBottomRow ? previewICPosition.col + (pinNum - 1) : previewICPosition.col + (14 - pinNum);
                  const hole = holes.find(h => h.id === `main-${pinRow}-${pinCol}`);
                  if (!hole) return null;
                  return (
                    <Circle
                      key={`preview-${pinNum}`}
                      x={hole.x}
                      y={hole.y}
                      radius={6}
                      fill="#00FF00"
                      opacity={0.8}
                    />
                  );
                })}
                
                {/* Add Here Button */}
                {(() => {
                  const startHole = holes.find(h => h.id === `main-${previewICPosition.row}-${previewICPosition.col}`);
                  if (!startHole) return null;
                  return (
                    <Group
                      x={startHole.x + 10}
                      y={startHole.y - 40}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        addComponent('IC', activeModel || undefined, previewICPosition);
                        setActiveComponentType(null);
                        setActiveModel(null);
                        setPreviewICPosition(null);
                      }}
                      onTap={(e) => {
                        e.cancelBubble = true;
                        addComponent('IC', activeModel || undefined, previewICPosition);
                        setActiveComponentType(null);
                        setActiveModel(null);
                        setPreviewICPosition(null);
                      }}
                    >
                      <Rect
                        width={80}
                        height={24}
                        fill="#44FF44"
                        cornerRadius={4}
                        stroke="#141414"
                        strokeWidth={1}
                      />
                      <Text
                        x={0}
                        y={6}
                        width={80}
                        text="ADD HERE"
                        fill="#141414"
                        fontSize={10}
                        fontStyle="bold"
                        align="center"
                      />
                    </Group>
                  );
                })()}
              </Group>
            )}
            {/* Components */}
            {circuit.components.map(comp => {
              const h = holes.find(x => x.id === `${comp.position.type}-${comp.position.row}-${comp.position.col}`);
              if (!h) return null;
              const isSelected = selectedComponentId === comp.id;
              if (comp.type === 'IC') {
                return (
                  <Group 
                    key={comp.id}
                    // draggable={isSelected}
                    onDragEnd={(e) => {
                      const newX = h.x + e.target.x();
                      const newY = h.y + e.target.y();
                      let nearestHole = holes[0];
                      let minDest = Infinity;
                      holes.forEach(hole => {
                        if (hole.type !== 'main') return;
                        const d = Math.sqrt((hole.x - newX)**2 + (hole.y - newY)**2);
                        if (d < minDest) {
                          minDest = d;
                          nearestHole = hole;
                        }
                      });
                      if (minDest < 40) {
                        setCircuit(prev => ({
                          ...prev,
                          components: prev.components.map(c => 
                            c.id === comp.id 
                              ? { ...c, position: { row: nearestHole.row, col: nearestHole.col, type: 'main' } } 
                              : c
                          )
                        }));
                      }
                      e.target.position({ x: 0, y: 0 });
                    }}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      setSelectedComponentId(comp.id);
                      setSelectedWireId(null);
                      setIsSidebarOpen(true);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      setSelectedComponentId(comp.id);
                      setSelectedWireId(null);
                      setIsSidebarOpen(true);
                    }}
                  >
                    <Rect
                      x={h.x - 8}
                      y={h.y - 11}
                      width={112}
                      height={45}
                      fill="#141414"
                      cornerRadius={4}
                      stroke={isSelected ? '#FF4444' : 'transparent'}
                      strokeWidth={2}
                    />
                    {/* IC Notch */}
                    <Circle 
                      x={h.x - 7}
                      y={h.y + 12}
                      radius={3.5}
                      fill="#eee"
                    />
                    {/* Pin 1 indicator dot */}
                    <Circle 
                      x={h.x}
                      y={h.y + 28}
                      radius={2}
                      fill="#ffffff"
                    />
                    <Text
                      x={h.x + 24}
                      y={h.y + 7}
                      text={comp.model ? (IC_DEFINITIONS[comp.model]?.shortName || comp.model) : ''}
                      fill="#E4E3E0"
                      fontSize={12}
                      fontStyle="bold"
                      fontFamily="monospace"
                    />
                    {comp.label && (
                      <Text
                        x={h.x - 8}
                        y={h.y - 30}
                        text={comp.label}
                        fill="var(--accent)"
                        fontSize={10}
                        fontStyle="bold"
                        fontFamily="monospace"
                        align="center"
                        width={112}
                      />
                    )}

                    {isSelected && (
                    <Group
                      x={h.x - 20}
                      y={h.y + 12}
                      onClick={() => {
                          setCircuit(prev => ({
                            ...prev,
                            components: prev.components.filter(c => c.id !== selectedComponentId)
                          }));
                          setSelectedComponentId(null);
                          setIsSidebarOpen(false);
                        }}
                      onTap={() => {
                          setCircuit(prev => ({
                            ...prev,
                            components: prev.components.filter(c => c.id !== selectedComponentId)
                          }));
                          setSelectedComponentId(null);
                          setIsSidebarOpen(false);
                        }}
                    >
                      <Circle radius={8} fill="#FF4444" />
                      <Line points={[-3, -3, 3, 3]} stroke="#FFFFFF" strokeWidth={1.5} />
                      <Line points={[-3, 3, 3, -3]} stroke="#FFFFFF" strokeWidth={1.5} />
                    </Group>
                  )}
                    
                  </Group>
                );
              }
              if (comp.type === 'LED') {
                const root1 = find(`${comp.position.type}-${comp.position.row}-${comp.position.col}`);
                const state1 = netStates.get(root1) || 'FLOATING';
                let isOn = false;
                
                let h2 = h;
                if (comp.position2) {
                  const hole2 = holes.find(x => x.id === `${comp.position2!.type}-${comp.position2!.row}-${comp.position2!.col}`);
                  if (hole2) {
                    h2 = hole2;
                    const root2 = find(hole2.id);
                    const state2 = netStates.get(root2) || 'FLOATING';
                    // LED works if one leg is HIGH and other is LOW
                    isOn = isRunning && ((state1 === 'HIGH' && state2 === 'LOW') || (state1 === 'LOW' && state2 === 'HIGH'));
                  }
                }

                return (
                  <Group 
                    key={comp.id}
                    // draggable={isSelected}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      setSelectedComponentId(comp.id);
                      setSelectedWireId(null);
                      setIsSidebarOpen(true);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      setSelectedComponentId(comp.id);
                      setSelectedWireId(null);
                      setIsSidebarOpen(true);
                    }}
                    >
                    <Line
                      points={[h.x, h.y, (h.x + h2.x) / 2, (h.y + h2.y) / 2 - 7]}
                      stroke="#141414"
                      strokeWidth={2}
                    />
                    <Line
                      points={[h2.x, h2.y, (h.x + h2.x) / 2, (h.y + h2.y) / 2 - 7]}
                      stroke="#141414"
                      strokeWidth={2}
                    />
                    <Circle
                      x={(h.x + h2.x) / 2}
                      y={(h.y + h2.y) / 2 - 15}
                      radius={8}
                      fill={isOn ? '#ef4444' : '#450a0a'}
                      stroke={isSelected ? '#37ff00' : '#141414'}
                      strokeWidth={isSelected ? 2 : 1}
                      shadowBlur={isOn ? 15 : 0}
                      shadowColor="#ef4444"
                    />

                    {isSelected && (
                    <Group
                      x={(h.x + h2.x) / 2 - 18}
                      y={(h.y + h2.y) / 2 - 15}
                      onClick={() => {
                          setCircuit(prev => ({
                            ...prev,
                            components: prev.components.filter(c => c.id !== selectedComponentId)
                          }));
                          setSelectedComponentId(null);
                          setIsSidebarOpen(false);
                        }}
                      onTap={() => {
                          setCircuit(prev => ({
                            ...prev,
                            components: prev.components.filter(c => c.id !== selectedComponentId)
                          }));
                          setSelectedComponentId(null);
                          setIsSidebarOpen(false);
                        }}
                    >
                      <Circle radius={8} fill="#FF4444" />
                      <Line points={[-3, -3, 3, 3]} stroke="#FFFFFF" strokeWidth={1.5} />
                      <Line points={[-3, 3, 3, -3]} stroke="#FFFFFF" strokeWidth={1.5} />
                    </Group>
                  )}
                  </Group>
                );
              }
              if (comp.type === 'SWITCH') {
                let h2 = h;
                if (comp.position2) {
                  const hole2 = holes.find(x => x.id === `${comp.position2!.type}-${comp.position2!.row}-${comp.position2!.col}`);
                  if (hole2) h2 = hole2;
                }

                return (
                  <Group 
                    key={comp.id} 
                    // draggable={isSelected}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      if (isSelected) {
                        setCircuit(prev => ({
                          ...prev,
                          components: prev.components.map(c => c.id === comp.id ? { ...c, state: !c.state } : c)
                        }));
                      } else {
                        setSelectedComponentId(comp.id);
                        setSelectedWireId(null);
                        setIsSidebarOpen(true);
                      }
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      if (isSelected) {
                        setCircuit(prev => ({
                          ...prev,
                          components: prev.components.map(c => c.id === comp.id ? { ...c, state: !c.state } : c)
                        }));
                      } else {
                        setSelectedComponentId(comp.id);
                        setSelectedWireId(null);
                        setIsSidebarOpen(true);
                      }
                    }}
                  >
                    <Line
                      points={[h.x, h.y, (h.x + h2.x) / 2, (h.y + h2.y) / 2 - 5]}
                      stroke="#141414"
                      strokeWidth={2}
                    />
                    <Line
                      points={[h2.x, h2.y, (h.x + h2.x) / 2, (h.y + h2.y) / 2 - 5]}
                      stroke="#141414"
                      strokeWidth={2}
                    />
                    <Rect
                      x={(h.x + h2.x) / 2 - 10}
                      y={(h.y + h2.y) / 2 - 15}
                      width={20}
                      height={20}
                      fill="#D4D3D0"
                      stroke={isSelected ? '#FF4444' : '#141414'}
                      strokeWidth={isSelected ? 2 : 1}
                    />
                    <Rect
                      x={(h.x + h2.x) / 2 - 8}
                      y={comp.state ? (h.y + h2.y) / 2 - 5 : (h.y + h2.y) / 2 - 13}
                      width={16}
                      height={8}
                      fill={comp.state ? '#319b04' : '#141414'}
                    />
                    {isSelected && (
                    <Group
                      x={(h.x + h2.x) / 2 - 20}
                      y={(h.y + h2.y) / 2 - 5}
                      onClick={() => {
                          setCircuit(prev => ({
                            ...prev,
                            components: prev.components.filter(c => c.id !== selectedComponentId)
                          }));
                          setSelectedComponentId(null);
                          setIsSidebarOpen(false);
                        }}
                      onTap={() => {
                          setCircuit(prev => ({
                            ...prev,
                            components: prev.components.filter(c => c.id !== selectedComponentId)
                          }));
                          setSelectedComponentId(null);
                          setIsSidebarOpen(false);
                        }}
                    >
                      <Circle radius={8} fill="#FF4444" />
                      <Line points={[-3, -3, 3, 3]} stroke="#FFFFFF" strokeWidth={1.5} />
                      <Line points={[-3, 3, 3, -3]} stroke="#FFFFFF" strokeWidth={1.5} />
                    </Group>
                  )}
                  </Group>
                );
              }
              if (comp.type === 'CLOCK') {
                const root = find(`${comp.position.type}-${comp.position.row}-${comp.position.col}`);
                const state = netStates.get(root) || 'FLOATING';
                const isOn = isRunning && state === 'HIGH';
                return (
                  <Group 
                    key={comp.id}
                    // draggable={isSelected}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      setSelectedComponentId(comp.id);
                      setSelectedWireId(null);
                      setIsSidebarOpen(true);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      setSelectedComponentId(comp.id);
                      setSelectedWireId(null);
                      setIsSidebarOpen(true);
                    }}
                  >
                    <Rect
                      x={h.x - 9}
                      y={h.y - 9}
                      width={18}
                      height={18}
                      fill="#141414"
                      cornerRadius={4}
                      stroke={isSelected ? '#FF4444' : 'transparent'}
                      strokeWidth={2}
                    />
                    <Text
                      x={h.x - 9}
                      y={h.y - 4}
                      width={18}
                      text="CLK"
                      fill={isOn ? '#44FF44' : '#E4E3E0'}
                      fontSize={8}
                      align="center"
                      fontStyle="bold"
                    />
                     {isSelected && (
                    <Group
                      x={h.x - 0}
                      y={h.y - 18}
                      onClick={() => {
                          setCircuit(prev => ({
                            ...prev,
                            components: prev.components.filter(c => c.id !== selectedComponentId)
                          }));
                          setSelectedComponentId(null);
                          setIsSidebarOpen(false);
                        }}
                      onTap={() => {
                          setCircuit(prev => ({
                            ...prev,
                            components: prev.components.filter(c => c.id !== selectedComponentId)
                          }));
                          setSelectedComponentId(null);
                          setIsSidebarOpen(false);
                        }}
                    >
                      <Circle radius={8} fill="#FF4444" />
                      <Line points={[-3, -3, 3, 3]} stroke="#FFFFFF" strokeWidth={1.5} />
                      <Line points={[-3, 3, 3, -3]} stroke="#FFFFFF" strokeWidth={1.5} />
                    </Group>)}
                  </Group>
                );
              }
              return null;
            })}

            {/* Wires */}
            {circuit.wires.map(w => {
              const from = holes.find(h => h.id === w.fromHoleId);
              const to = holes.find(h => h.id === w.toHoleId);
              if (!from || !to) return null;
              const isSelected = selectedWireId === w.id;
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              let ctrlX = midX;
              let ctrlY = midY;
              
              if (dist > 0) {
                const offset = Math.min(dist * 0.2, 30);
                if (Math.abs(dx) >= Math.abs(dy)) {
                  ctrlY -= offset;
                } else {
                  if (midX > 550) {
                    ctrlX -= offset;
                  } else {
                    ctrlX += offset;
                  }
                }
              }
              const root = find(w.fromHoleId);
              const state = netStates.get(root) || 'FLOATING';
              let color = w.color || '#94a3b8';
              if (state === 'HIGH') color = '#f87171';
              if (state === 'LOW') color = '#60a5fa';
              return (
                <Group key={w.id}>
                  <Line
                    points={[from.x, from.y, ctrlX, ctrlY, to.x, to.y]}
                    stroke={isSelected ? '#FF4444' : color}
                    strokeWidth={isSelected ? 5 : 3}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.5}
                    opacity={0.8}
                    onClick={(e) => {
                      e.cancelBubble = true;
                      setSelectedWireId(w.id);
                      setSelectedComponentId(null);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      setSelectedWireId(w.id);
                      setSelectedComponentId(null);
                    }}
                  />
                  {/* Delete Button */}
                  {isSelected && (
                    <Group
                      x={ctrlX}
                      y={ctrlY}
                      onClick={(e) => {
                        e.cancelBubble = true;
                        setCircuit(prev => ({ ...prev, wires: prev.wires.filter(wire => wire.id !== w.id) }));
                        setSelectedWireId(null);
                      }}
                      onTap={(e) => {
                        e.cancelBubble = true;
                        setCircuit(prev => ({ ...prev, wires: prev.wires.filter(wire => wire.id !== w.id) }));
                        setSelectedWireId(null);
                      }}
                    >
                      <Circle radius={8} fill="#FF4444" />
                      <Line points={[-3, -3, 3, 3]} stroke="#FFFFFF" strokeWidth={1.5} />
                      <Line points={[-3, 3, 3, -3]} stroke="#FFFFFF" strokeWidth={1.5} />
                    </Group>
                  )}
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>
      {/* Toolbar - Right side (Desktop) / Top center (Mobile) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 md:top-1/2 md:right-6 md:left-auto md:translate-x-0 md:-translate-y-1/2 z-30 flex flex-col items-center gap-2 w-[95%] max-w-xl md:w-auto md:max-w-none">
        <div className="futuristic-glass p-1.5 md:p-3 flex md:flex-col items-center gap-1.5 md:gap-3 w-full md:w-auto overflow-x-auto md:overflow-y-auto no-scrollbar rounded-2xl shadow-2xl border border-[var(--border)]">
          <div className="flex md:flex-col items-center gap-1.5 md:gap-3 border-r md:border-r-0 md:border-b border-[var(--border)] pr-1.5 mr-0.5 md:pr-0 md:mr-0 md:pb-3 md:mb-1 shrink-0">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2 md:p-3 rounded-xl transition-all flex flex-col md:flex-row items-center gap-1 ${isRunning ? 'bg-red-500 text-white neon-glow' : 'hover:bg-[var(--border)] text-[var(--fg)]'}`}
              title={isRunning ? "Stop Simulation" : "Start Simulation"}
            >
              {isRunning ? <Square size={18} className="md:w-5 md:h-5" /> : <Play size={18} className="md:w-5 md:h-5" />}
              <span className="text-[8px] md:text-[9px] font-bold uppercase block md:hidden">{isRunning ? 'Stop' : 'Run'}</span>
            </button>
            <button 
              onClick={undo}
              className="p-2 md:p-3 hover:bg-[var(--border)] text-[var(--fg)] rounded-xl transition-all flex flex-col md:flex-row items-center gap-1"
              title="Undo"
            >
              <RotateCcw size={18} className="md:w-5 md:h-5" />
              <span className="text-[8px] md:text-[9px] font-bold uppercase block md:hidden">Undo</span>
            </button>
          </div>
          <div className="flex md:flex-col items-center gap-1 md:gap-2 shrink-0">
            {[
              { id: 'LED', icon: <Lightbulb size={18} className="md:w-5 md:h-5" />, label: 'LED' },
              { id: 'SWITCH', icon: <Zap size={18} className="md:w-5 md:h-5" />, label: 'SW' },
              { id: 'CLOCK', icon: <Play size={18} className="rotate-90 md:w-5 md:h-5" />, label: 'CLK' },
              { id: '7400', icon: <Cpu size={18} className="md:w-5 md:h-5" />, label: '00' },
              { id: '7404', icon: <Cpu size={18} className="md:w-5 md:h-5" />, label: '04' },
              { id: '7408', icon: <Cpu size={18} className="md:w-5 md:h-5" />, label: '08' },
              { id: '7432', icon: <Cpu size={18} className="md:w-5 md:h-5" />, label: '32' },
              { id: '7490', icon: <Cpu size={18} className="md:w-5 md:h-5" />, label: '90' },
              { id: '7474', icon: <Cpu size={18} className="md:w-5 md:h-5" />, label: '74' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (['LED', 'SWITCH', 'CLOCK'].includes(item.id)) {
                    setActiveComponentType(item.id as any);
                    setActiveModel(null);
                  } else {
                    setActiveComponentType('IC');
                    setActiveModel(item.id);
                  }
                }}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  (activeComponentType === item.id || activeModel === item.id) 
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] neon-glow' 
                    : 'hover:bg-[var(--border)] text-[var(--muted)]'
                }`}
                title={item.label}
              >
                {item.icon}
                <span className="text-[8px] font-bold uppercase block md:hidden">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="ml-auto md:ml-0 flex md:flex-col items-center gap-1.5 md:gap-3 pl-1.5 md:pl-0 border-l md:border-l-0 md:border-t border-[var(--border)] shrink-0 md:pt-3 md:mt-1">
            <button 
              onClick={() => setShowCloudSave(true)}
              className="p-2 md:p-3 hover:bg-[var(--border)] text-[var(--fg)] rounded-xl transition-all flex flex-col md:flex-row items-center gap-1"
              title="Save"
            >
              <Save size={18} className="md:w-5 md:h-5" />
              <span className="text-[8px] font-bold uppercase block md:hidden">Save</span>
            </button>
            <button 
              onClick={() => setShowCloudLoad(true)}
              className="p-2 md:p-3 hover:bg-[var(--border)] text-[var(--fg)] rounded-xl transition-all flex flex-col md:flex-row items-center gap-1"
              title="Load"
            >
              <FolderOpen size={18} className="md:w-5 md:h-5" />
              <span className="text-[8px] font-bold uppercase block md:hidden">Load</span>
            </button>
            <button 
              onClick={confirmReset}
              className="p-2 md:p-3 hover:bg-red-500/10 text-red-500 rounded-xl transition-all flex flex-col md:flex-row items-center gap-1"
              title="Clear All"
            >
              <Trash2 size={18} className="md:w-5 md:h-5" />
              <span className="text-[8px] font-bold uppercase block md:hidden">Clear</span>
            </button>
          </div>
        </div>
      </div>
      {/* Zoom Controls - Always visible at bottom left */}
      <div className="absolute bottom-4 left-4 z-30 flex flex-col gap-2">
        <button 
          onClick={() => setZoom(z => Math.min(z + 0.1, 3))} 
          className="p-2 futuristic-glass rounded-xl hover:bg-[var(--accent)] hover:text-[var(--accent-fg)] transition-all shadow-lg"
          title="Zoom In"
        >
          <Plus size={20} />
        </button>
        <button 
          onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))} 
          className="p-2 futuristic-glass rounded-xl hover:bg-[var(--accent)] hover:text-[var(--accent-fg)] transition-all shadow-lg"
          title="Zoom Out"
        >
          <Minus size={20} />
        </button>
        <button 
          onClick={resetView} 
          className="p-2 futuristic-glass rounded-xl hover:bg-[var(--accent)] hover:text-[var(--accent-fg)] transition-all shadow-lg"
          title="Reset View"
        >
          <Maximize size={20} />
        </button>
        <div className="text-[10px] font-mono text-center mt-1 bg-[var(--bg)]/80 px-2 py-1 rounded-lg">
          {Math.round(zoom * 100)}%
        </div>
      </div>
      {/* Modals & Overlays */}
      <AnimatePresence>
        {showCloudSave && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg)]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md futuristic-glass p-8 rounded-2xl shadow-2xl relative"
            >
              <button onClick={() => setShowCloudSave(false)} className="absolute top-4 right-4 p-2 text-[var(--muted)]"><X size={20} /></button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl neon-glow"><Save size={24} /></div>
                <div>
                  <h2 className="text-xl font-mono font-bold uppercase tracking-tighter">Save Circuit</h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">Commit to system storage</p>
                </div>
              </div>
              <div className="space-y-6">
                <button onClick={saveCircuitLocal} className="w-full flex items-center gap-4 p-4 bg-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-fg)] transition-all rounded-xl group">
                  <HardDrive size={20} className="text-[var(--accent)] group-hover:text-inherit" />
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-widest">Local Export</div>
                    <div className="text-[8px] opacity-50">Download as .json file</div>
                  </div>
                </button>
                <div className="h-px bg-[var(--border)]" />
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[var(--muted)] ml-1">Circuit Name</label>
                    <input 
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      className="w-full bg-[var(--border)] p-3 text-sm rounded-xl focus:outline-none focus:border-[var(--accent)] border border-transparent"
                      placeholder="e.g. 4-bit Counter"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setIsPublic(false)}
                      className={`p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${!isPublic ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-transparent neon-glow' : 'border-[var(--border)] text-[var(--muted)]'}`}
                    >
                      <Lock size={14} /> Private
                    </button>
                    <button 
                      onClick={() => setIsPublic(true)}
                      className={`p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${isPublic ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-transparent neon-glow' : 'border-[var(--border)] text-[var(--muted)]'}`}
                    >
                      <Globe size={14} /> Public
                    </button>
                  </div>
                  <button 
                    onClick={handleCloudSave}
                    disabled={isSaving || !user}
                    className="w-full bg-[var(--fg)] text-[var(--bg)] p-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? 'Syncing...' : user ? 'Cloud Sync' : 'Auth Required'}
                    <Cloud size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {showCloudLoad && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--bg)]/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md futuristic-glass p-8 rounded-2xl shadow-2xl relative flex flex-col max-h-[80vh]"
            >
              <button onClick={() => setShowCloudLoad(false)} className="absolute top-4 right-4 p-2 text-[var(--muted)]"><X size={20} /></button>
              
              <div className="flex items-center gap-4 mb-8 shrink-0">
                <div className="p-3 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl neon-glow"><FolderOpen size={24} /></div>
                <div>
                  <h2 className="text-xl font-mono font-bold uppercase tracking-tighter">Load Circuit</h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">Restore from storage</p>
                </div>
              </div>
              <div className="space-y-6 overflow-y-auto no-scrollbar">
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-4 p-4 bg-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-fg)] transition-all rounded-xl group">
                  <Upload size={20} className="text-[var(--accent)] group-hover:text-inherit" />
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-widest">Local Import</div>
                    <div className="text-[8px] opacity-50">Upload .json file</div>
                  </div>
                </button>
                <input type="file" ref={fileInputRef} onChange={loadCircuitLocal} accept=".json" className="hidden" />
                <div className="h-px bg-[var(--border)]" />
                <div className="space-y-4">
                  <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Cloud Archives</div>
                  {!user ? (
                    <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xl">
                      <p className="text-[10px] font-bold uppercase text-[var(--muted)] mb-4">Authentication Required</p>
                      <Link href="/login" className="inline-block px-6 py-2 bg-[var(--accent)] text-[var(--accent-fg)] text-[10px] font-bold uppercase rounded-lg">Sign In</Link>
                    </div>
                  ) : isLoadingCircuits ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[var(--accent)]" /></div>
                  ) : userCircuits.length === 0 ? (
                    <p className="text-center text-[10px] uppercase font-bold text-[var(--muted)] py-8">No archives found</p>
                  ) : (
                    <div className="space-y-2">
                      {userCircuits.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => handleCloudLoad(c.data)}
                          className="w-full p-4 bg-[var(--border)] hover:border-[var(--accent)] border border-transparent rounded-xl transition-all text-left flex items-center justify-between group"
                        >
                          <div>
                            <div className="text-xs font-bold uppercase tracking-tight">{c.name}</div>
                            <div className="text-[8px] opacity-40">{new Date(c.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                          </div>
                          <ChevronRight size={16} className="text-[var(--muted)] group-hover:text-[var(--accent)]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}