import { useGame } from '../state/useGame.ts';
import {
  PRODUCTION_BUILDINGS,
  STORAGE_BUILDINGS,
} from '../data/buildings.js';

const GROUP_ORDER = [
  'Food',
  'Raw Materials',
  'Construction Materials',
  'Science',
  'Energy',
  'Settlement',
  'Utilities',
];

export function useBuildingGroups() {
  const { state } = useGame();
  const completedResearch = state.research.completed || [];

  const isUnlocked = (b: any) =>
    !b.requiresResearch ||
    completedResearch.includes(b.requiresResearch) ||
    (state.buildings[b.id]?.count || 0) > 0;

  const prodBuildings = PRODUCTION_BUILDINGS.filter(isUnlocked);
  const storageBuildings = STORAGE_BUILDINGS.filter(isUnlocked);

  const prodGroups: Record<string, any[]> = {};
  prodBuildings.forEach((b) => {
    const cat = b.category || 'Production';
    if (!prodGroups[cat]) prodGroups[cat] = [];
    prodGroups[cat].push(b);
  });

  const prodGroupKeys = [
    ...GROUP_ORDER.filter((g) => prodGroups[g]),
    ...Object.keys(prodGroups).filter((k) => !GROUP_ORDER.includes(k)),
  ];

  const productionGroups = prodGroupKeys.map((key) => ({
    name: key,
    buildings: prodGroups[key],
  }));

  return { productionGroups, storageBuildings, completedResearch };
}

