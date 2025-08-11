export const BUILDINGS = [
  {
    id: 'potatoField',
    name: 'Potato Field',
    category: 'food',
    growthTime: 5,
    harvestAmount: 10,
    resource: 'food',
    yieldValue: 1,
    cost: { scrap: 10 },
    demolishRefundRatio: 0.5,
  },
  {
    id: 'cornField',
    name: 'Corn Field',
    category: 'food',
    growthTime: 1,
    harvestAmount: 1,
    resource: 'food',
    yieldValue: 2,
    cost: { scrap: 25 },
    demolishRefundRatio: 0.5,
  },
  {
    id: 'ricePaddy',
    name: 'Rice Paddy',
    category: 'food',
    growthTime: 0.5,
    harvestAmount: 1,
    resource: 'food',
    yieldValue: 1,
    cost: { scrap: 40 },
    demolishRefundRatio: 0.5,
  },
  {
    id: 'loggingCamp',
    name: 'Logging Camp',
    category: 'resources',
    growthTime: 2,
    harvestAmount: 1,
    resource: 'wood',
    yieldValue: 1,
    cost: { scrap: 50 },
    demolishRefundRatio: 0.5,
  },
]

export const FOOD_BUILDINGS = BUILDINGS.filter((b) => b.category === 'food')
export const RESOURCE_BUILDINGS = BUILDINGS.filter(
  (b) => b.category === 'resources',
)
