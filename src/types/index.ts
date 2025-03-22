export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface Project {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  structure: GreenhouseStructure;
  shared: SharedUser[];
}

export interface SharedUser {
  userId: string;
  projectId: string;
  permission: 'read' | 'edit';
}

export interface GreenhouseStructure {
  model: string;
  width: number;
  length: number;
  height: number;
  vents: Vent[];
  glazing: Glazing[];
  heating: Heating[];
  cooling: Cooling[];
  benches: Bench[];
  controls: Control[];
}

export interface Vent {
  id: string;
  type: string;
  quantity: number;
  size: string;
}

export interface Glazing {
  id: string;
  type: string;
  quantity: number;
  size: string;
}

export interface Heating {
  id: string;
  type: string;
  capacity: number;
}

export interface Cooling {
  id: string;
  type: string;
  capacity: number;
}

export interface Bench {
  id: string;
  type: string;
  width: number;
  length: number;
  quantity: number;
}

export interface Control {
  id: string;
  type: string;
  description: string;
}