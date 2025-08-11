export const BUILDINGS = [
  {
    id: 'potatoField',
    name: 'Potato Field',
    type: 'production',
    outputsPerSecBase: { potatoes: 0.375 },
    costBase: { wood: 15 },
    costGrowth: 1.15,
    refund: 0.5,
    description: 'Reliable staple crop. Strongly affected by seasons.',
  },
  {
    id: 'loggingCamp',
    name: 'Logging Camp',
    type: 'production',
    outputsPerSecBase: { wood: 0.2 },
    costBase: { scrap: 15 },
    costGrowth: 1.15,
    refund: 0.5,
    description: 'Steady wood income. Slight weather impact.',
  },
  {
    id: 'scrapyard',
    name: 'Scrap Yard',
    type: 'production',
    outputsPerSecBase: { scrap: 0.06 },
    costBase: { wood: 12 },
    costGrowth: 1.15,
    refund: 0.5,
    description: 'Collects scrap from nearby ruins.',
  },
  {
    id: 'quarry',
    name: 'Quarry',
    type: 'production',
    outputsPerSecBase: { stone: 0.08 },
    costBase: { wood: 20, scrap: 5 },
    costGrowth: 1.15,
    refund: 0.5,
    description: 'Extracts stone slowly but steadily.',
  },
  {
    id: 'school',
    name: 'School',
    type: 'production',
    outputsPerSecBase: { science: 0.5 },
    costBase: { wood: 25, scrap: 10, stone: 10 },
    costGrowth: 1.15,
    refund: 0.5,
    description: 'Provides basic education and generates science.',
  },
  {
    id: 'foodStorage',
    name: 'Granary',
    type: 'storage',
    costBase: { wood: 20, scrap: 5, stone: 5 },
    costGrowth: 1.15,
    refund: 0.5,
    capacityAdd: { potatoes: 300 },
    description: 'Increases storage for harvested crops.',
  },
  {
    id: 'rawStorage',
    name: 'Warehouse',
    type: 'storage',
    costBase: { wood: 25, scrap: 10, stone: 10 },
    costGrowth: 1.15,
    refund: 0.5,
    capacityAdd: { wood: 200, stone: 80, scrap: 120 },
    description: 'Increases storage for wood, stone and scrap.',
  },
];

export const BUILDING_MAP = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));
export const PRODUCTION_BUILDINGS = BUILDINGS.filter(
  (b) => b.type === 'production',
);
export const STORAGE_BUILDINGS = BUILDINGS.filter((b) => b.type === 'storage');

export function getBuildingCost(building, countBuilt) {
  const factor = Math.pow(building.costGrowth, countBuilt);
  const result = {};
  Object.entries(building.costBase).forEach(([res, amt]) => {
    result[res] = Math.ceil(amt * factor);
  });
  return result;
}
