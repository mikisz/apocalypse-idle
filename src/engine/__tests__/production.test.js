import { describe, expect, test, vi, beforeEach } from 'vitest'
import * as prod from '../production.js'
import * as time from '../time.js'

const baseState = {
  resources: {
    food: { amount: 0, capacity: 100, stocks: {} },
    wood: { amount: 0, capacity: 100, stocks: {} },
  },
  storage: {
    food: { base: 100, fromBuildings: 0 },
    wood: { base: 100, fromBuildings: 0 },
  },
  population: { settlers: [] },
  buildings: {},
  timers: {},
}

const makeState = () => JSON.parse(JSON.stringify(baseState))

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('production engine', () => {
  test('applies seasonal modifiers', () => {
    const state = {
      ...makeState(),
      buildings: { potatoField: { count: 1 } },
      timers: { food: { potatoField: 0 } },
    }
    vi.spyOn(time, 'getSeasonModifiers').mockReturnValue({
      farmingSpeed: 0.5,
      farmingYield: 2,
    })
    const next = prod.processTick(state, 1)
    expect(next.resources.food.amount).toBe(20)
  })

  test('clamps resources to capacity', () => {
    const state = {
      ...makeState(),
      resources: {
        food: { amount: 95, capacity: 100, stocks: {} },
      },
      buildings: {
        fastFarm: { resource: 'food', rate: 10, count: 1 },
      },
    }
    const next = prod.processTick(state, 1)
    expect(next.resources.food.amount).toBe(100)
  })

  test('does not allow negative resources', () => {
    const state = {
      ...makeState(),
      buildings: {
        sink: { resource: 'food', rate: -5, count: 1 },
      },
    }
    const next = prod.processTick(state, 1)
    expect(next.resources.food.amount).toBe(0)
  })

  test('demolition refunds half the cost', () => {
    const base = makeState()
    const state = {
      ...base,
      buildings: { potatoField: { count: 1 } },
      resources: { ...base.resources, wood: { amount: 0, capacity: 100, stocks: {} } },
    }
    const next = prod.demolishBuilding(state, 'potatoField')
    expect(next.buildings.potatoField.count).toBe(0)
    expect(next.resources.wood.amount).toBe(5)
  })
})
