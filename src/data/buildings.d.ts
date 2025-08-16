export interface Building {
  id: string;
  name: string;
  type: string;
  category?: string;
  costBase: Record<string, number>;
  costGrowth: number;
  refund?: number;
  description?: string;
  outputsPerSecBase?: Record<string, number>;
  inputsPerSecBase?: Record<string, number>;
  requiresResearch?: string;
  maxCount?: number;
  requiresPower?: boolean;
  capacityAdd?: Record<string, number>;
}

export const BUILDINGS: Building[];
export const BUILDING_MAP: Record<string, Building>;
export const PRODUCTION_BUILDINGS: Building[];
export const STORAGE_BUILDINGS: Building[];
export function getBuildingCost(
  building: Building,
  countBuilt: number,
): Record<string, number>;
