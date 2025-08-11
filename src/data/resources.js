export const RESOURCES = {
  food: { id: 'food', name: 'Food', tier: 0, type: 'consumable', category: 'food', baseCapacity: 300, perStorage: 200, seasonalKeys: ['farmingSpeed', 'farmingYield'] },
  wood: { id: 'wood', name: 'Wood', tier: 0, type: 'raw', category: 'resources', baseCapacity: 100, perStorage: 200, seasonalKeys: ['workSpeed', 'workYield'] },
  plank: { id: 'plank', name: 'Planks', tier: 1, type: 'processed', category: 'resources', baseCapacity: 0, perStorage: 0, seasonalKeys: ['workSpeed', 'workYield'] },
  scrap: { id: 'scrap', name: 'Scrap', tier: 0, type: 'raw', category: 'resources', baseCapacity: 100, perStorage: 200, seasonalKeys: ['workSpeed'] },
  metal: { id: 'metal', name: 'Metal Bars', tier: 1, type: 'processed', category: 'resources', baseCapacity: 0, perStorage: 0, seasonalKeys: ['smeltingSpeed', 'smeltingYield'] },
  water: { id: 'water', name: 'Water', tier: 0, type: 'consumable', category: 'food', baseCapacity: 100, perStorage: 200, seasonalKeys: ['workSpeed', 'seasonRain'] },
}

export const RESOURCE_LIST = Object.values(RESOURCES)
