import { describe, expect, test, vi, beforeEach } from 'vitest'
import * as prod from '../production.js'
import * as time from '../time.js'
import { BUILDINGS } from '../../data/buildings.js'

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
    vi.spyOn(time, 'getSeason').mockReturnValue({
      id: 'test',
      modifiers: { food: { speed: 0.5, yield: 2 } },
    })
    const next = prod.processTick(state, 1)
    expect(next.resources.food.amount).toBe(20)
  })

  test('parity for existing buildings across seasons', () => {
    const seasons = [
      { id: 'spring', modifiers: { food: { speed: 0.8, yield: 1.1 }, wood: { speed: 0.8, yield: 1.1 } } },
      { id: 'summer', modifiers: { food: { speed: 1.0, yield: 1.0 }, wood: { speed: 1.0, yield: 1.0 } } },
      { id: 'autumn', modifiers: { food: { speed: 1.1, yield: 1.0 }, wood: { speed: 1.1, yield: 1.0 } } },
      { id: 'winter', modifiers: { food: { speed: 2.0, yield: 0.0 }, wood: { speed: 2.0, yield: 0.0 } } },
    ]
    const building = BUILDINGS.find((b) => b.id === 'potatoField')
    const base = {
      ...makeState(),
      buildings: { potatoField: { count: 1 } },
      timers: { food: { potatoField: 0 } },
    }
    const getSeasonSpy = vi.spyOn(time, 'getSeason')
    seasons.forEach((season) => {
      getSeasonSpy.mockReturnValue(season)
      const next = prod.processTick(base, 1)
      const mods = season.modifiers.food
      const expected = building.harvestAmount * mods.yield * building.yieldValue
      expect(next.resources.food.amount).toBe(expected)
    })
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

  test('seasonal mode ignore removes winter penalty', () => {
    const farm = BUILDINGS.find((b) => b.id === 'potatoField')
    const original = farm.seasonal
    farm.seasonal = { mode: 'ignore' }
    const season = { id: 'winter', modifiers: { food: { speed: 2, yield: 0 } } }
    vi.spyOn(time, 'getSeason').mockReturnValue(season)
    const state = {
      ...makeState(),
      buildings: { potatoField: { count: 1 } },
      timers: { food: { potatoField: 0 } },
    }
    const next = prod.processTick(state, 1)
    expect(next.resources.food.amount).toBe(
      farm.harvestAmount * farm.yieldValue,
    )
    farm.seasonal = original
  })

  test('seasonal mode custom overrides global modifier', () => {
    const farm = BUILDINGS.find((b) => b.id === 'potatoField')
    const original = farm.seasonal
    farm.seasonal = {
      mode: 'custom',
      modifiers: { winter: { food: 1.0 } },
    }
    const season = { id: 'winter', modifiers: { food: { speed: 2, yield: 0 } } }
    vi.spyOn(time, 'getSeason').mockReturnValue(season)
    const state = {
      ...makeState(),
      buildings: { potatoField: { count: 1 } },
      timers: { food: { potatoField: 0 } },
    }
    const next = prod.processTick(state, 1)
    expect(next.resources.food.amount).toBe(
      farm.harvestAmount * farm.yieldValue,
    )
    farm.seasonal = original
  })
})
