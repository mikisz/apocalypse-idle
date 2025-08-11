import { describe, expect, test, vi, beforeEach } from 'vitest'
import * as prod from '../production.js'
import * as time from '../time.js'
import { BUILDINGS, getBuildingCost } from '../../data/buildings.js'
import { getCapacity } from '../../state/selectors.js'

const baseState = {
  resources: {
    food: { amount: 0 },
    wood: { amount: 0 },
    plank: { amount: 0 },
    scrap: { amount: 0 },
    metal: { amount: 0 },
    water: { amount: 0 },
  },
  population: { settlers: [] },
  buildings: {},
  timers: {},
}

const clone = (obj) => JSON.parse(JSON.stringify(obj))

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('production engine', () => {
  test('applies seasonal modifiers', () => {
    const state = clone(baseState)
    state.buildings.potatoField = { count: 1 }
    state.timers.food = { potatoField: 0 }
    vi.spyOn(time, 'getSeason').mockReturnValue({
      id: 'test',
      modifiers: { farmingSpeed: 0.5, farmingYield: 2 },
    })
    const next = prod.processTick(state, 1)
    expect(next.resources.food.amount).toBe(6)
  })

  test('demolition refunds half the cost with scaling', () => {
    const state = clone(baseState)
    state.buildings.potatoField = { count: 2 }
    const next = prod.demolishBuilding(state, 'potatoField')
    const costPrev = getBuildingCost(
      BUILDINGS.find((b) => b.id === 'potatoField'),
      1,
    )
    expect(next.buildings.potatoField.count).toBe(1)
    expect(next.resources.wood.amount).toBe(Math.floor(costPrev.wood * 0.5))
  })

  test('clamps resources to capacity', () => {
    const state = clone(baseState)
    state.buildings.potatoField = { count: 1 }
    state.timers.food = { potatoField: 0 }
    const cap = getCapacity(state, 'food')
    const next = prod.processTick(state, 100000)
    expect(next.resources.food.amount).toBe(cap)
  })
})
