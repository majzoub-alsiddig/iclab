export type LogicLevel = 'HIGH' | 'LOW' | 'FLOATING';

export interface Point {
  x: number;
  y: number;
}

export interface Hole {
  id: string;
  x: number;
  y: number;
  row: number;
  col: number;
  type: 'rail' | 'main';
  railType?: 'VCC' | 'GND';
}

export interface ComponentInstance {
  id: string;
  type: 'IC' | 'LED' | 'RESISTOR' | 'POWER' | 'SWITCH' | 'CLOCK';
  model?: string; // e.g., '7400'
  state?: boolean; // For switches or clock state
  frequency?: number; // For clocks
  position: { row: number; col: number; type: 'main' | 'rail' }; // Primary pin position
  position2?: { row: number; col: number; type: 'main' | 'rail' }; // Secondary pin position for 2-port devices
  rotation: number;
  labels?: Record<number, string>; // Pin number to label
  label?: string; // General component label
}

export interface Wire {
  id: string;
  fromHoleId: string;
  toHoleId: string;
  color: string;
}

export interface CircuitState {
  components: ComponentInstance[];
  wires: Wire[];
}

export interface PinDefinition {
  number: number;
  type: 'input' | 'output' | 'vcc' | 'gnd' | 'nc';
  gateId?: number;
}

export interface ICDefinition {
  model: string;
  name: string;
  shortName: string;
  pins: PinDefinition[];
  logic: (inputs: LogicLevel[], currentState?: any) => { output: LogicLevel | LogicLevel[], newState?: any };
}
