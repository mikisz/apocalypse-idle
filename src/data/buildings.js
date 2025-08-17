import { SHELTER_COST_GROWTH, SHELTER_MAX } from './settlement.js';

export const BUILDINGS = [
  {
    id: 'potatoField',
    name: 'Potato Field',
    type: 'production',
    category: 'Food',
    outputsPerSecBase: { potatoes: 0.375 },
    costBase: { wood: 17 }, // changed: 15→17
    costGrowth: 1.12, // changed: 1.13 -> 1.12
    refund: 0.5,
    description: 'Reliable staple crop. Strongly affected by seasons.',
  },
  {
    id: 'huntersHut',
    name: "Hunter's Hut",
    type: 'production',
    category: 'Food',
    requiresResearch: 'huntingHut',
    outputsPerSecBase: { meat: 0.22 }, // changed: 0.19 -> 0.22
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
    costGrowth: 1.12, // changed: 1.13 -> 1.12
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
    costGrowth: 1.12, // changed: 1.13 -> 1.12
    refund: 0.5,
    description: 'Collects scrap from nearby ruins.',
  },
  {
    id: 'quarry',
    name: 'Quarry',
    type: 'production',
    category: 'Raw Materials',
    outputsPerSecBase: { stone: 0.12 }, // changed: 0.104 -> 0.12
    costBase: { wood: 20, scrap: 5 },
    costGrowth: 1.12, // changed: 1.13 -> 1.12
    refund: 0.5,
    description: 'Extracts stone slowly but steadily.',
  },
  {
    id: 'brickKiln',
    name: 'Brick Kiln',
    domain: 'PROCESSING',
    type: 'processing',
    category: 'Construction Materials',
    requiresResearch: 'masonry1',
    inputsPerSecBase: { stone: 0.4, wood: 0.3 },
    outputsPerSecBase: { bricks: 0.4 },
    costBase: { wood: 35, stone: 25, scrap: 10 },
    costGrowth: 1.13,
    refund: 0.5,
    seasonProfile: 'constant',
    description: 'Fires stone and wood into bricks.',
  },
  {
    id: 'sawmill',
    name: 'Sawmill',
    type: 'processing',
    category: 'Construction Materials',
    requiresResearch: 'industry1',
    inputsPerSecBase: { wood: 0.8 },
    outputsPerSecBase: { planks: 0.5 },
    costBase: { wood: 53, scrap: 20, stone: 13 }, // changed: wood 48 -> 53, scrap 18 -> 20, stone 12 -> 13
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
    id: 'toolsmithy',
    name: 'Toolsmithy',
    type: 'processing',
    category: 'Construction Materials',
    requiresResearch: 'industry2',
    requiresPower: true,
    inputsPerSecBase: { planks: 0.25, metalParts: 0.15, power: 0.4 },
    outputsPerSecBase: { tools: 0.18 },
    costBase: { wood: 50, scrap: 30, stone: 20, planks: 25, metalParts: 15 },
    costGrowth: 1.13,
    refund: 0.5,
    seasonProfile: 'constant',
    description: 'Produces tools for advanced construction.',
  },
  {
    id: 'school',
    name: 'School',
    type: 'production',
    category: 'Science',
    outputsPerSecBase: { science: 0.2 }, // changed: 0.45→0.2
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
    costBase: { wood: 50, stone: 10, planks: 20, metalParts: 10 },
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
    description: 'Houses one settler.',
  },
  {
    id: 'radio',
    name: 'Radio',
    type: 'production',
    category: 'Utilities',
    requiresResearch: 'radio',
    requiresPower: true,
    inputsPerSecBase: { power: 0.1 },
    costBase: { wood: 80, scrap: 40, stone: 20, planks: 20, metalParts: 10 }, // changed: +planks 20
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
    costGrowth: 1.22, // changed: 1.2 -> 1.22
    refund: 0.5,
    capacityAdd: { FOOD: 225 },
    cardTextOverride: 'Food Capacity +225',
    description: 'Increases storage for harvested crops.',
  },
  {
    id: 'largeGranary',
    name: 'Large Granary',
    domain: 'STORAGE',
    type: 'storage',
    requiresResearch: 'masonry2',
    costBase: { wood: 35, stone: 20, bricks: 20 },
    costGrowth: 1.15,
    refund: 0.5,
    capacityAdd: { FOOD: 600 },
    cardTextOverride: 'Food Capacity +600',
    description: 'Increases total Food capacity across all food types.',
  },
  {
    id: 'rawStorage',
    name: 'Warehouse',
    type: 'storage',
    costBase: { wood: 25, scrap: 10, stone: 10 },
    costGrowth: 1.22, // changed: 1.2 -> 1.22
    refund: 0.5,
    capacityAdd: { wood: 120, scrap: 80, stone: 60 }, // changed: wood 200->120, scrap 90->80, stone 80->60
    description: 'Increases storage for wood, stone and scrap.',
  },
  {
    id: 'largeWarehouse',
    name: 'Large Warehouse',
    domain: 'STORAGE',
    type: 'storage',
    requiresResearch: 'masonry2',
    costBase: { wood: 40, stone: 30, bricks: 20 },
    costGrowth: 1.15,
    refund: 0.5,
    capacityAdd: { wood: 400, stone: 160, scrap: 240 },
    description: 'Expanded storage for raw materials.',
  },
  {
    id: 'materialsDepot',
    name: 'Materials Depot',
    type: 'storage',
    requiresResearch: 'industry1',
    costBase: { wood: 25, scrap: 10, stone: 5 },
    costGrowth: 1.22, // changed: 1.2 -> 1.22
    refund: 0.5,
    capacityAdd: { planks: 100, metalParts: 40 }, // changed: planks 300->100, metalParts 240->40
    description: 'Stores processed construction materials.',
  },
  {
    id: 'largeMaterialsDepot',
    name: 'Large Materials Depot',
    domain: 'STORAGE',
    type: 'storage',
    requiresResearch: 'masonry2',
    costBase: { wood: 35, bricks: 25, scrap: 15 },
    costGrowth: 1.15,
    refund: 0.5,
    capacityAdd: { planks: 180, metalParts: 90, bricks: 180 },
    description: 'Expanded storage for processed construction materials.',
  },
  {
    id: 'library',
    name: 'Library',
    type: 'storage',
    costBase: { wood: 40, stone: 20, scrap: 10 },
    costGrowth: 1.22,
    refund: 0.5,
    capacityAdd: { science: 100 },
    requiresResearch: 'library',
    description: 'Stores scientific knowledge for future breakthroughs.',
  },
  {
    id: 'battery',
    name: 'Battery',
    type: 'storage',
    costBase: { wood: 40, stone: 20, planks: 20, metalParts: 10 },
    costGrowth: 1.22, // changed: 1.2 -> 1.22
    refund: 0.5,
    capacityAdd: { power: 40 }, // changed: 600->40
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
