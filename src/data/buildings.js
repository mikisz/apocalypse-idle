export const BUILDINGS = [
  {
    id: 'potatoField',
    name: 'Pole Ziemniaków',
    type: 'production',
    outputsPerSecBase: { potatoes: 0.375 },
    costBase: { wood: 20 },
    costGrowth: 1.15,
    refund: 0.5,
    description: 'Reliable staple crop. Production follows seasons.',
  },
  {
    id: 'loggingCamp',
    name: 'Chatka Drwala',
    type: 'production',
    outputsPerSecBase: { wood: 0.2 },
    costBase: { scrap: 30 },
    costGrowth: 1.15,
    refund: 0.5,
    description: 'Steady wood income. Slightly affected by weather.',
  },
  {
    id: 'scrapyard',
    name: 'Złomowisko',
    type: 'production',
    outputsPerSecBase: { scrap: 0.06 },
    costBase: { wood: 35 },
    costGrowth: 1.15,
    refund: 0.5,
    description: 'Collects scrap from nearby ruins.',
  },
  {
    id: 'quarry',
    name: 'Kamieniołom',
    type: 'production',
    outputsPerSecBase: { stone: 0.08 },
    costBase: { wood: 40, scrap: 15 },
    costGrowth: 1.15,
    refund: 0.5,
    description: 'Extracts stone slowly but steadily.',
  },
  {
    id: 'foodStorage',
    name: 'Spichlerz',
    type: 'storage',
    costBase: { wood: 30, scrap: 10, stone: 10 },
    costGrowth: 1.15,
    refund: 0.5,
    capacityAdd: { potatoes: 300, corn: 300, rice: 300 },
    description: 'Increases storage for harvested crops.',
  },
  {
    id: 'rawStorage',
    name: 'Magazyn Surowców',
    type: 'storage',
    costBase: { wood: 40, scrap: 20, stone: 20 },
    costGrowth: 1.15,
    refund: 0.5,
    capacityAdd: { wood: 200, stone: 200, scrap: 200 },
    description: 'Increases storage for wood, stone and scrap.',
  },
];

export const BUILDING_MAP = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));
export const PRODUCTION_BUILDINGS = BUILDINGS.filter((b) => b.type === 'production');
export const STORAGE_BUILDINGS = BUILDINGS.filter((b) => b.type === 'storage');

export function getBuildingCost(building, countBuilt) {
  const factor = Math.pow(building.costGrowth, countBuilt);
  const result = {};
  Object.entries(building.costBase).forEach(([res, amt]) => {
    result[res] = Math.ceil(amt * factor);
  });
  return result;
}
