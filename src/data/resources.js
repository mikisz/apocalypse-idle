export const RESOURCES = {
  potatoes: { id: 'potatoes', name: 'Potatoes', category: 'FOOD', startingAmount: 0, startingCapacity: 300 },
  corn: { id: 'corn', name: 'Corn', category: 'FOOD', startingAmount: 0, startingCapacity: 300 },
  rice: { id: 'rice', name: 'Rice', category: 'FOOD', startingAmount: 0, startingCapacity: 300 },
  wood: { id: 'wood', name: 'Wood', category: 'RAW', startingAmount: 0, startingCapacity: 100 },
  stone: { id: 'stone', name: 'Stone', category: 'RAW', startingAmount: 0, startingCapacity: 100 },
  scrap: { id: 'scrap', name: 'Scrap', category: 'RAW', startingAmount: 0, startingCapacity: 100 },
};

export const RESOURCE_LIST = Object.values(RESOURCES);
