export const RESOURCES = {
  potatoes: {
    id: 'potatoes',
    name: 'Potatoes',
    icon: '🥔',
    category: 'FOOD',
    startingAmount: 0,
    startingCapacity: 200, // changed: 450 -> 200
  },
  meat: {
    id: 'meat',
    name: 'Meat',
    icon: '🍖',
    category: 'FOOD',
    startingAmount: 0,
    startingCapacity: 100, // changed: 150 -> 100
    unit: '',
  },
  wood: {
    id: 'wood',
    name: 'Wood',
    icon: '🪵',
    category: 'RAW',
    startingAmount: 0,
    startingCapacity: 80, // changed: 150 -> 80
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    icon: '🪨',
    category: 'RAW',
    startingAmount: 0,
    startingCapacity: 50, // changed: 80 -> 50
  },
  scrap: {
    id: 'scrap',
    name: 'Scrap',
    icon: '♻️',
    category: 'RAW',
    startingAmount: 0,
    startingCapacity: 60, // changed: 80 -> 60
  },
  planks: {
    id: 'planks',
    name: 'Planks',
    icon: '\u{1F332}',
    category: 'CONSTRUCTION_MATERIALS',
    startingAmount: 0,
    startingCapacity: 40, // changed: 50 -> 40
  },
  metalParts: {
    id: 'metalParts',
    name: 'Metal Parts',
    icon: '\u2699\uFE0F',
    category: 'CONSTRUCTION_MATERIALS',
    startingAmount: 0,
    startingCapacity: 24, // changed: 20 -> 24
  },
  science: {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    category: 'SOCIETY',
    startingAmount: 0,
    startingCapacity: 400,
  },
  power: {
    id: 'power',
    name: 'Power',
    icon: '⚡',
    category: 'ENERGY',
    startingAmount: 0,
    startingCapacity: 20, // changed: 2 -> 20
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);
