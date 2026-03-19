import { Hole, Wire, ComponentInstance, CircuitState } from './circuit-types';
import { IC_DEFINITIONS } from './simulation-engine';

export function calculateNets(holes: Hole[], circuit: CircuitState) {
  const parent = new Map<string, string>();

  function find(id: string): string {
    if (!parent.has(id)) {
      parent.set(id, id);
      return id;
    }
    if (parent.get(id) === id) return id;
    const root = find(parent.get(id)!);
    parent.set(id, root);
    return root;
  }

  function union(id1: string, id2: string) {
    const root1 = find(id1);
    const root2 = find(id2);
    if (root1 !== root2) {
      parent.set(root1, root2);
    }
  }

  // 1. Internal breadboard connections
  // Main area columns (0-4 and 5-9)
  for (let c = 0; c < 30; c++) {
    for (let r = 0; r < 4; r++) {
      union(`main-${r}-${c}`, `main-${r+1}-${c}`);
      union(`main-${r+5}-${c}`, `main-${r+6}-${c}`);
    }
  }
  // Rail rows
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 29; c++) {
      union(`rail-${r}-${c}`, `rail-${r}-${c+1}`);
    }
  }

  // 2. Wires
  circuit.wires.forEach(w => {
    union(w.fromHoleId, w.toHoleId);
  });

  // 3. Component internal connections (e.g., closed switches)
  circuit.components.forEach(comp => {
    if (comp.type === 'SWITCH' && comp.state && comp.position2) {
      const id1 = `${comp.position.type}-${comp.position.row}-${comp.position.col}`;
      const id2 = `${comp.position2.type}-${comp.position2.row}-${comp.position2.col}`;
      union(id1, id2);
    }
  });

  // Group holes by net
  const nets = new Map<string, string[]>();
  holes.forEach(h => {
    const root = find(h.id);
    if (!nets.has(root)) nets.set(root, []);
    nets.get(root)!.push(h.id);
  });

  return { nets, find };
}
