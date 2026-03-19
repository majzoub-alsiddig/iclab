import { LogicLevel, CircuitState, ComponentInstance, Wire, ICDefinition } from './circuit-types';

export const IC_DEFINITIONS: Record<string, ICDefinition> = {
  '7400': {
    model: '7400',
    name: 'Quad 2-input NAND',
    shortName: 'NAND 00',
    pins: [
      { number: 1, type: 'input', gateId: 1 }, { number: 2, type: 'input', gateId: 1 }, { number: 3, type: 'output', gateId: 1 },
      { number: 4, type: 'input', gateId: 2 }, { number: 5, type: 'input', gateId: 2 }, { number: 6, type: 'output', gateId: 2 },
      { number: 7, type: 'gnd' },
      { number: 8, type: 'output', gateId: 3 }, { number: 9, type: 'input', gateId: 3 }, { number: 10, type: 'input', gateId: 3 },
      { number: 11, type: 'output', gateId: 4 }, { number: 12, type: 'input', gateId: 4 }, { number: 13, type: 'input', gateId: 4 },
      { number: 14, type: 'vcc' }
    ],
    logic: (inputs: LogicLevel[]) => {
      const resolved = inputs.map(i => i === 'FLOATING' ? 'HIGH' : i);
      return { output: resolved.every(i => i === 'HIGH') ? 'LOW' : 'HIGH' };
    }
  },
  '7402': {
    model: '7402',
    name: 'Quad 2-input NOR',
    shortName: 'NOR 02',
    pins: [
      { number: 1, type: 'output', gateId: 1 }, { number: 2, type: 'input', gateId: 1 }, { number: 3, type: 'input', gateId: 1 },
      { number: 4, type: 'output', gateId: 2 }, { number: 5, type: 'input', gateId: 2 }, { number: 6, type: 'input', gateId: 2 },
      { number: 7, type: 'gnd' },
      { number: 8, type: 'input', gateId: 3 }, { number: 9, type: 'input', gateId: 3 }, { number: 10, type: 'output', gateId: 3 },
      { number: 11, type: 'input', gateId: 4 }, { number: 12, type: 'input', gateId: 4 }, { number: 13, type: 'output', gateId: 4 },
      { number: 14, type: 'vcc' }
    ],
    logic: (inputs: LogicLevel[]) => {
      const resolved = inputs.map(i => i === 'FLOATING' ? 'HIGH' : i);
      return { output: resolved.some(i => i === 'HIGH') ? 'LOW' : 'HIGH' };
    }
  },
  '7404': {
    model: '7404',
    name: 'Hex Inverter',
    shortName: 'NOT 04',
    pins: [
      { number: 1, type: 'input', gateId: 1 }, { number: 2, type: 'output', gateId: 1 },
      { number: 3, type: 'input', gateId: 2 }, { number: 4, type: 'output', gateId: 2 },
      { number: 5, type: 'input', gateId: 3 }, { number: 6, type: 'output', gateId: 3 },
      { number: 7, type: 'gnd' },
      { number: 8, type: 'output', gateId: 4 }, { number: 9, type: 'input', gateId: 4 },
      { number: 10, type: 'output', gateId: 5 }, { number: 11, type: 'input', gateId: 5 },
      { number: 12, type: 'output', gateId: 6 }, { number: 13, type: 'input', gateId: 6 },
      { number: 14, type: 'vcc' }
    ],
    logic: (inputs: LogicLevel[]) => {
      const resolved = inputs.map(i => i === 'FLOATING' ? 'HIGH' : i);
      return { output: resolved[0] === 'HIGH' ? 'LOW' : 'HIGH' };
    }
  },
  '7432': {
    model: '7432',
    name: 'Quad 2-input OR',
    shortName: 'OR 32',
    pins: [
      { number: 1, type: 'input', gateId: 1 }, { number: 2, type: 'input', gateId: 1 }, { number: 3, type: 'output', gateId: 1 },
      { number: 4, type: 'input', gateId: 2 }, { number: 5, type: 'input', gateId: 2 }, { number: 6, type: 'output', gateId: 2 },
      { number: 7, type: 'gnd' },
      { number: 8, type: 'output', gateId: 3 }, { number: 9, type: 'input', gateId: 3 }, { number: 10, type: 'input', gateId: 3 },
      { number: 11, type: 'output', gateId: 4 }, { number: 12, type: 'input', gateId: 4 }, { number: 13, type: 'input', gateId: 4 },
      { number: 14, type: 'vcc' }
    ],
    logic: (inputs: LogicLevel[]) => {
      const resolved = inputs.map(i => i === 'FLOATING' ? 'HIGH' : i);
      return { output: resolved.some(i => i === 'HIGH') ? 'HIGH' : 'LOW' };
    }
  },
  '7408': {
    model: '7408',
    name: 'Quad 2-input AND',
    shortName: 'AND 08',
    pins: [
      { number: 1, type: 'input', gateId: 1 }, { number: 2, type: 'input', gateId: 1 }, { number: 3, type: 'output', gateId: 1 },
      { number: 4, type: 'input', gateId: 2 }, { number: 5, type: 'input', gateId: 2 }, { number: 6, type: 'output', gateId: 2 },
      { number: 7, type: 'gnd' },
      { number: 8, type: 'output', gateId: 3 }, { number: 9, type: 'input', gateId: 3 }, { number: 10, type: 'input', gateId: 3 },
      { number: 11, type: 'output', gateId: 4 }, { number: 12, type: 'input', gateId: 4 }, { number: 13, type: 'input', gateId: 4 },
      { number: 14, type: 'vcc' }
    ],
    logic: (inputs: LogicLevel[]) => {
      const resolved = inputs.map(i => i === 'FLOATING' ? 'HIGH' : i);
      if (resolved.length === 0) return { output: 'LOW' };
      return { output: resolved.every(i => i === 'HIGH') ? 'HIGH' : 'LOW' };
    }
  },
  '7486': {
    model: '7486',
    name: 'Quad 2-input XOR',
    shortName: 'XOR 86',
    pins: [
      { number: 1, type: 'input', gateId: 1 }, { number: 2, type: 'input', gateId: 1 }, { number: 3, type: 'output', gateId: 1 },
      { number: 4, type: 'input', gateId: 2 }, { number: 5, type: 'input', gateId: 2 }, { number: 6, type: 'output', gateId: 2 },
      { number: 7, type: 'gnd' },
      { number: 8, type: 'output', gateId: 3 }, { number: 9, type: 'input', gateId: 3 }, { number: 10, type: 'input', gateId: 3 },
      { number: 11, type: 'output', gateId: 4 }, { number: 12, type: 'input', gateId: 4 }, { number: 13, type: 'input', gateId: 4 },
      { number: 14, type: 'vcc' }
    ],
    logic: (inputs: LogicLevel[]) => {
      const resolved = inputs.map(i => i === 'FLOATING' ? 'HIGH' : i);
      const highCount = resolved.filter(i => i === 'HIGH').length;
      return { output: highCount % 2 === 1 ? 'HIGH' : 'LOW' };
    }
  },
  '7490': {
    model: '7490',
    name: 'Decade Counter',
    shortName: 'CNTR 90',
    pins: [
      { number: 1, type: 'input', gateId: 1 }, // CKB
      { number: 2, type: 'input', gateId: 0 }, // R0(1)
      { number: 3, type: 'input', gateId: 0 }, // R0(2)
      { number: 4, type: 'nc' },
      { number: 5, type: 'vcc' },
      { number: 6, type: 'input', gateId: 0 }, // R9(1)
      { number: 7, type: 'input', gateId: 0 }, // R9(2)
      { number: 8, type: 'output', gateId: 3 }, // QC
      { number: 9, type: 'output', gateId: 2 }, // QB
      { number: 10, type: 'gnd' },
      { number: 11, type: 'output', gateId: 4 }, // QD
      { number: 12, type: 'output', gateId: 1 }, // QA
      { number: 13, type: 'nc' },
      { number: 14, type: 'input', gateId: 1 }, // CKA
    ],
    logic: (inputs: LogicLevel[], currentState: any) => {
      // Simplified 7490 logic: 
      // It's a complex IC, but we can simulate it as a 4-bit counter
      // State: { count: number, lastClock: LogicLevel }
      const state = currentState || { count: 0, lastClock: 'LOW' };
      const clock = inputs[0] || 'LOW';
      let count = state.count;

      if (state.lastClock === 'HIGH' && clock === 'LOW') { // Falling edge
        count = (count + 1) % 10;
      }

      const outputs: LogicLevel[] = [
        (count & 1) ? 'HIGH' : 'LOW',
        (count & 2) ? 'HIGH' : 'LOW',
        (count & 4) ? 'HIGH' : 'LOW',
        (count & 8) ? 'HIGH' : 'LOW',
      ];

      return { output: outputs, newState: { count, lastClock: clock } };
    }
  },
  '7474': {
    model: '7474',
    name: 'Dual D Flip-Flop',
    shortName: 'DFF 74',
    pins: [
      { number: 1, type: 'input', gateId: 1 }, // CLR1
      { number: 2, type: 'input', gateId: 1 }, // D1
      { number: 3, type: 'input', gateId: 1 }, // CLK1
      { number: 4, type: 'input', gateId: 1 }, // PRE1
      { number: 5, type: 'output', gateId: 1 }, // Q1
      { number: 6, type: 'output', gateId: 1 }, // /Q1
      { number: 7, type: 'gnd' },
      { number: 8, type: 'output', gateId: 2 }, // /Q2
      { number: 9, type: 'output', gateId: 2 }, // Q2
      { number: 10, type: 'input', gateId: 2 }, // PRE2
      { number: 11, type: 'input', gateId: 2 }, // CLK2
      { number: 12, type: 'input', gateId: 2 }, // D2
      { number: 13, type: 'input', gateId: 2 }, // CLR2
      { number: 14, type: 'vcc' }
    ],
    logic: (inputs: LogicLevel[], currentState: any) => {
      // inputs: [CLR, D, CLK, PRE]
      const [clr, d, clk, pre] = inputs;
      const state = currentState || { q: 'LOW', lastClock: 'LOW' };
      let q = state.q;

      if (clr === 'LOW') q = 'LOW';
      else if (pre === 'LOW') q = 'HIGH';
      else if (state.lastClock === 'LOW' && clk === 'HIGH') { // Rising edge
        q = d === 'HIGH' ? 'HIGH' : 'LOW';
      }

      const nq = q === 'HIGH' ? 'LOW' : 'HIGH';
      return { output: [q, nq], newState: { q, lastClock: clk } };
    }
  }
};

export class SimulationEngine {
  private holeToNetId: Map<string, string> = new Map();
  private netStates: Map<string, LogicLevel> = new Map();

  constructor(private state: CircuitState) {}

  // Simplified simulation for now
  // In a real app, we'd build a graph of connections
  simulate() {
    // 1. Reset nets
    this.netStates.clear();
    
    // 2. Map holes to nets based on breadboard strips and wires
    // (This logic will be implemented in the component to keep it simple for now)
  }
}
