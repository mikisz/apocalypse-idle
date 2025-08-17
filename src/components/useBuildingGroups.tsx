import { useGame } from '../state/useGame.tsx';
import {
  PRODUCTION_BUILDINGS,
  STORAGE_BUILDINGS,
  type Building as BuildingDefinition,
} from '../data/buildings.js';

export interface BuildingGroup {
  name: string;
  buildings: BuildingDefinition[];
}

const GROUP_ORDER = [
  'Food',
  'Raw Materials',
  'Construction Materials',
  'Science',
  'Energy',
  'Settlement',
  'Utilities',
];

export function useBuildingGroups(): {
  productionGroups: BuildingGroup[];
  storageBuildings: BuildingDefinition[];
  completedResearch: string[];
} {
  const { state } = useGame();
  const completedResearch: string[] = state.research.completed || [];

  const isUnlocked = (b: BuildingDefinition) =>
    !b.requiresResearch ||
    completedResearch.includes(b.requiresResearch) ||
    ((state.buildings as Record<string, { count: number }>)[b.id]?.count || 0) >
      0;

  const prodBuildings = PRODUCTION_BUILDINGS.filter(isUnlocked);
  const storageBuildings: BuildingDefinition[] =
    STORAGE_BUILDINGS.filter(isUnlocked);

  const prodGroups: Record<string, BuildingDefinition[]> = {};
  prodBuildings.forEach((b) => {
    const cat = b.category || 'Production';
    if (!prodGroups[cat]) prodGroups[cat] = [];
    prodGroups[cat].push(b);
  });

  const prodGroupKeys = [
    ...GROUP_ORDER.filter((g) => prodGroups[g]),
    ...Object.keys(prodGroups).filter((k) => !GROUP_ORDER.includes(k)),
  ];

  const productionGroups: BuildingGroup[] = prodGroupKeys.map((key) => ({
    name: key,
    buildings: prodGroups[key],
  }));

  return { productionGroups, storageBuildings, completedResearch };
}
