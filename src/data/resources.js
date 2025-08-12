export const RESOURCES = {
  potatoes: {
    id: 'potatoes',
    name: 'Potatoes',
    icon: '🥔',
    category: 'FOOD',
    startingAmount: 0,
    startingCapacity: 450, // changed: 300→450
  },
  meat: {
    id: 'meat',
    name: 'Meat',
    icon: '🍖',
    category: 'FOOD',
    startingAmount: 0,
    startingCapacity: 150, // changed: 300→150
    unit: '',
  },
  wood: {
    id: 'wood',
    name: 'Wood',
    icon: '🪵',
    category: 'RAW',
    startingAmount: 0,
    startingCapacity: 150, // changed: 100→150
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    icon: '🪨',
    category: 'RAW',
    startingAmount: 0,
    startingCapacity: 80, // changed: 100→80
  },
  scrap: {
    id: 'scrap',
    name: 'Scrap',
    icon: '♻️',
    category: 'RAW',
    startingAmount: 0,
    startingCapacity: 80, // changed: 100→80
  },
  planks: {
    id: 'planks',
    name: 'Planks',
    icon: '\u{1F332}',
    category: 'CONSTRUCTION_MATERIALS',
    startingAmount: 0,
    startingCapacity: 50,
  },
  metalParts: {
    id: 'metalParts',
    name: 'Metal Parts',
    icon: '\u2699\uFE0F',
    category: 'CONSTRUCTION_MATERIALS',
    startingAmount: 0,
    startingCapacity: 20,
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
    startingCapacity: 2,
  },
};

export const RESOURCE_LIST = Object.values(RESOURCES);
