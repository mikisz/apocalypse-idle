export type ResourceMap = Record<string, number>;

export interface BuildingData {
  id: string;
  type?: string;
  category?: string;
  costBase?: ResourceMap;
  costGrowth: number;
  outputsPerSecBase?: ResourceMap;
  inputsPerSecBase?: ResourceMap;
  seasonProfile?: 'constant' | Record<string, number>;
  capacityAdd?: ResourceMap;
}

export interface SeasonData {
  multipliers: Record<string, number>;
}

export type SeasonsRecord = Record<string, SeasonData>;
