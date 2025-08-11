export const BUILDINGS = [
  {
    id: 'potatoField',
    name: 'Potato Field',
    category: 'food',
    cost: { scrap: 0, wood: 20, plank: 0, metal: 0 },
    cycleTimeSec: 8,
    harvestAmount: 3,
    outputResource: 'food',
    outputValue: 1,
    seasonSpeedKey: 'farmingSpeed',
    seasonYieldKey: 'farmingYield',
    startsWithCount: 1,
  },
  {
    id: 'cornField',
    name: 'Corn Field',
    category: 'food',
    cost: { scrap: 0, wood: 30, plank: 0, metal: 0 },
    cycleTimeSec: 5,
    harvestAmount: 1,
    outputResource: 'food',
    outputValue: 2,
    seasonSpeedKey: 'farmingSpeed',
    seasonYieldKey: 'farmingYield',
    startsWithCount: 0,
  },
  {
    id: 'ricePaddy',
    name: 'Rice Paddy',
    category: 'food',
    cost: { scrap: 0, wood: 15, plank: 0, metal: 0 },
    cycleTimeSec: 3,
    harvestAmount: 1,
    outputResource: 'food',
    outputValue: 1,
    seasonSpeedKey: 'farmingSpeed',
    seasonYieldKey: 'farmingYield',
    startsWithCount: 0,
  },
  {
    id: 'loggingCamp',
    name: 'Logging Camp',
    category: 'resources',
    cost: { scrap: 50, wood: 0, plank: 0, metal: 0 },
    cycleTimeSec: 6,
    harvestAmount: 1,
    outputResource: 'wood',
    outputValue: 1,
    seasonSpeedKey: 'workSpeed',
    seasonYieldKey: 'workYield',
    startsWithCount: 1,
  },
  {
    id: 'sawmill',
    name: 'Sawmill',
    category: 'resources',
    cost: { scrap: 30, wood: 40, plank: 10, metal: 0 },
    cycleTimeSec: 4,
    harvestAmount: 1,
    outputResource: 'plank',
    outputValue: 1,
    seasonSpeedKey: 'workSpeed',
    seasonYieldKey: 'workYield',
    startsWithCount: 0,
  },
  {
    id: 'scrapYard',
    name: 'Scrap Yard',
    category: 'resources',
    cost: { scrap: 0, wood: 0, plank: 0, metal: 0 },
    cycleTimeSec: 7,
    harvestAmount: 1,
    outputResource: 'scrap',
    outputValue: 1,
    seasonSpeedKey: 'workSpeed',
    seasonYieldKey: 'workYield',
    startsWithCount: 0,
  },
  {
    id: 'smelter',
    name: 'Smelter',
    category: 'industry',
    cost: { scrap: 100, wood: 50, plank: 20, metal: 0 },
    cycleTimeSec: 10,
    harvestAmount: 1,
    outputResource: 'metal',
    outputValue: 1,
    seasonSpeedKey: 'smeltingSpeed',
    seasonYieldKey: 'smeltingYield',
    startsWithCount: 0,
  },
  {
    id: 'granary',
    name: 'Granary',
    category: 'storage',
    cost: { scrap: 20, wood: 60, plank: 10, metal: 0 },
    addsCapacity: { food: 200 },
    startsWithCount: 0,
  },
  {
    id: 'warehouse',
    name: 'Warehouse',
    category: 'storage',
    cost: { scrap: 30, wood: 80, plank: 20, metal: 0 },
    addsCapacity: { wood: 200, scrap: 200 },
    startsWithCount: 0,
  },
]

export const BUILDING_MAP = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]))
export const FOOD_BUILDINGS = BUILDINGS.filter((b) => b.category === 'food')
export const RESOURCE_BUILDINGS = BUILDINGS.filter((b) => b.category === 'resources')
export const STORAGE_BUILDINGS = BUILDINGS.filter((b) => b.category === 'storage')
export const INDUSTRY_BUILDINGS = BUILDINGS.filter((b) => b.category === 'industry')

export function getBuildingCost(building, countBuilt) {
  const factor = Math.pow(1.15, countBuilt)
  const result = {}
  Object.entries(building.cost || {}).forEach(([res, amt]) => {
    result[res] = Math.ceil(amt * factor)
  })
  return result
}
