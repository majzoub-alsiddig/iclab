import { useState, useMemo } from 'react';
import { Hole, Point, CircuitState, Wire, ComponentInstance } from '../lib/circuit-types';

const ROWS = 10; // 5 + 5
const COLS = 30;
const HOLE_SPACING = 16;
const YHOLE_SPACING = 24;
const MARGIN = 40;

export function useBreadboard() {
  const holes = useMemo(() => {
    const h: Hole[] = [];
    
    // Main area
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const yOffset = r >= 5 ? 0 : 0;
        h.push({
          id: `main-${r}-${c}`,
          row: r,
          col: c,
          x: MARGIN + c * HOLE_SPACING,
          y: MARGIN + 42 + r * YHOLE_SPACING + yOffset,
          type: 'main'
        });
      }
    }

    // Rails
    const railY = [MARGIN, MARGIN + 20, MARGIN + 60 + ROWS * HOLE_SPACING + 60, MARGIN + 60 + ROWS * HOLE_SPACING + 80];
    const railTypes: ('VCC' | 'GND')[] = ['VCC', 'GND', 'GND', 'VCC'];
    
    railY.forEach((y, rIdx) => {
      for (let c = 0; c < COLS; c++) {
        h.push({
          id: `rail-${rIdx}-${c}`,
          row: rIdx,
          col: c,
          x: MARGIN + c * HOLE_SPACING,
          y: y,
          type: 'rail',
          railType: railTypes[rIdx]
        });
      }
    });

    return h;
  }, []);

  const [circuit, setCircuit] = useState<CircuitState>({
    components: [],
    wires: []
  });
  const [history, setHistory] = useState<{ type: 'wire' | 'component', id: string }[]>([]);

  const addWire = (fromHoleId: string, toHoleId: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newWire: Wire = {
      id,
      fromHoleId,
      toHoleId,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    setCircuit(prev => ({ ...prev, wires: [...prev.wires, newWire] }));
    setHistory(prev => [...prev, { type: 'wire', id }]);
  };

  const addComponent = (type: ComponentInstance['type'], model?: string, pos?: ComponentInstance['position'], pos2?: ComponentInstance['position2']) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newComp: ComponentInstance = {
      id,
      type,
      model,
      position: pos || { row: 4, col: 5, type: 'main' },
      position2: pos2,
      rotation: 0
    };
    setCircuit(prev => ({ ...prev, components: [...prev.components, newComp] }));
    setHistory(prev => [...prev, { type: 'component', id }]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    
    setCircuit(prev => {
      if (lastAction.type === 'wire') {
        return { ...prev, wires: prev.wires.filter(w => w.id !== lastAction.id) };
      } else {
        return { ...prev, components: prev.components.filter(c => c.id !== lastAction.id) };
      }
    });
  };

  const reset = () => {
    setCircuit({ components: [], wires: [] });
    setHistory([]);
  };

  return { holes, circuit, addWire, addComponent, setCircuit, undo, reset };
}
