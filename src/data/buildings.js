import { SHELTER_COST_GROWTH, SHELTER_MAX } from './settlement.js';

export const BUILDINGS = [
  {
    id: 'potatoField',
    name: 'Potato Field',
    type: 'production',
    category: 'Food',
    outputsPerSecBase: { potatoes: 0.375 },
    costBase: { wood: 17 }, // changed: 15→17
    costGrowth: 1.13, // changed: 1.15→1.13
    refund: 0.5,
    description: 'Reliable staple crop. Strongly affected by seasons.',
  },
  {
    id: 'huntersHut',
    name: "Hunter's Hut",
    type: 'production',
    category: 'Food',
    requiresResearch: 'hunting1',
    outputsPerSecBase: { meat: 0.19 }, // changed: 0.15→0.19
    costBase: { wood: 25, scrap: 10, stone: 5 },
    costGrowth: 1.15,
    refund: 0.5,
    seasonProfile: { spring: 1.1, summer: 1.0, autumn: 0.9, winter: 0.6 }, // changed: winter 0.8→0.6
    description:
      'Hunts for meat year-round; less affected by seasons than crops.',
  },
  {
    id: 'loggingCamp',
    name: 'Logging Camp',
    type: 'production',
    category: 'Raw Materials',
    outputsPerSecBase: { wood: 0.3 }, // changed: 0.25→0.3
    costBase: { scrap: 15 },
    costGrowth: 1.13, // changed: 1.15→1.13
    refund: 0.5,
    description: 'Steady wood income. Slight weather impact.',
  },
  {
    id: 'scrapyard',
    name: 'Scrap Yard',
    type: 'production',
    category: 'Raw Materials',
    outputsPerSecBase: { scrap: 0.08 },
    costBase: { wood: 12 },
    costGrowth: 1.13, // changed: 1.15→1.13
    refund: 0.5,
    description: 'Collects scrap from nearby ruins.',
  },
  {
    id: 'quarry',
    name: 'Quarry',
    type: 'production',
    category: 'Raw Materials',
    outputsPerSecBase: { stone: 0.104 }, // changed: 0.08→0.104
    costBase: { wood: 20, scrap: 5 },
    costGrowth: 1.13, // changed: 1.15→1.13
    refund: 0.5,
    description: 'Extracts stone slowly but steadily.',
  },
  {
    id: 'sawmill',
    name: 'Sawmill',
    type: 'processing',
    category: 'Construction Materials',
    requiresResearch: 'industry1',
    inputsPerSecBase: { wood: 0.8 },
    outputsPerSecBase: { planks: 0.5 },
    costBase: { wood: 48, scrap: 18, stone: 12 }, // changed: wood 40→48, scrap 15→18, stone 10→12
    costGrowth: 1.13, // changed: 1.15→1.13
    refund: 0.5,
    seasonProfile: 'constant',
    description: 'Converts wood into planks.',
  },
  {
    id: 'metalWorkshop',
    name: 'Metal Workshop',
    type: 'processing',
    category: 'Construction Materials',
    requiresResearch: 'industry1',
    inputsPerSecBase: { scrap: 0.4 },
    outputsPerSecBase: { metalParts: 0.4 },
    costBase: { wood: 30, scrap: 30, stone: 10, planks: 10 },
    costGrowth: 1.13, // changed: 1.15→1.13
    refund: 0.5,
    seasonProfile: 'constant',
    description: 'Processes scrap into metal parts.',
  },
  {
    id: 'school',
    name: 'School',
    type: 'production',
    category: 'Science',
    outputsPerSecBase: { science: 0.45 }, // changed: 0.5→0.45
    costBase: { wood: 30, scrap: 12, stone: 12 }, // changed: wood 25→30, scrap 10→12, stone 10→12
    costGrowth: 1.13, // changed: 1.15→1.13
    refund: 0.5,
    description: 'Provides basic education and generates science.',
  },
  {
    id: 'woodGenerator',
    name: 'Wood Generator',
    type: 'production',
    category: 'Energy',
    outputsPerSecBase: { power: 1 },
    inputsPerSecBase: { wood: 0.25 },
    costBase: { wood: 50, stone: 10 },
    costGrowth: 1.13, // changed: 1.15→1.13
    refund: 0.5,
    requiresResearch: 'basicEnergy',
    description:
      'Burns wood to generate power. Excess power is lost if storage is full.',
  },
  {
    id: 'shelter',
    name: 'Shelter',
    type: 'production',
    category: 'Settlement',
    costBase: { wood: 30, scrap: 10 },
    costGrowth: SHELTER_COST_GROWTH,
    refund: 0.5,
    maxCount: SHELTER_MAX,
    description: 'Houses one settler. Max: 5',
  },
  {
    id: 'radio',
    name: 'Radio',
    type: 'production',
    category: 'Utilities',
    requiresResearch: 'radio',
    requiresPower: true,
    inputsPerSecBase: { power: 0.1 },
    costBase: { wood: 80, scrap: 40, stone: 20, planks: 20 }, // changed: +planks 20
    costGrowth: 1,
    refund: 0.5,
    maxCount: 1,
    description: 'Requires power to operate. Attracts settlers over time.',
  },
  {
    id: 'foodStorage',
    name: 'Granary',
    type: 'storage',
    costBase: { wood: 20, scrap: 5, stone: 5 },
    costGrowth: 1.2, // changed: 1.15→1.2
    refund: 0.5,
    capacityAdd: { potatoes: 300, meat: 150 },
    description: 'Increases storage for harvested crops.',
  },
  {
    id: 'rawStorage',
    name: 'Warehouse',
    type: 'storage',
    costBase: { wood: 25, scrap: 10, stone: 10 },
    costGrowth: 1.2, // changed: 1.15→1.2
    refund: 0.5,
    capacityAdd: { wood: 200, stone: 80, scrap: 90 }, // changed: scrap 120→90
    description: 'Increases storage for wood, stone and scrap.',
  },
  {
    id: 'materialsDepot',
    name: 'Materials Depot',
    type: 'storage',
    requiresResearch: 'industry1',
    costBase: { wood: 25, scrap: 10, stone: 5 },
    costGrowth: 1.2, // changed: 1.15→1.2
    refund: 0.5,
    capacityAdd: { planks: 300, metalParts: 240 }, // changed: planks 150→300, metalParts 60→240
    description: 'Stores processed construction materials.',
  },
  {
    id: 'battery',
    name: 'Battery',
    type: 'storage',
    costBase: { wood: 40, stone: 20 },
    costGrowth: 1.2, // changed: 1.15→1.2
    refund: 0.5,
    capacityAdd: { power: 600 }, // changed: 40→600
    requiresResearch: 'basicEnergy',
    description: 'Allows storing more generated Power.',
  },
];

export const BUILDING_MAP = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));
export const PRODUCTION_BUILDINGS = BUILDINGS.filter(
  (b) => b.type === 'production' || b.type === 'processing',
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
