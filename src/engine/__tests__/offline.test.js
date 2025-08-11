import { describe, test, expect, vi, beforeEach } from 'vitest'
import { applyOfflineProgress, processTick } from '../production.js'
import * as time from '../time.js'

const baseState = {
  resources: {
    food: { amount: 0, capacity: 100, stocks: {} },
  },
  storage: { food: { base: 100, fromBuildings: 0 } },
  population: { settlers: [] },
  buildings: {},
  timers: {},
  gameTime: { seconds: 0 },
}

const clone = (obj) => JSON.parse(JSON.stringify(obj))

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(time, 'getSeason').mockReturnValue({ id: 'test', modifiers: {} })
})

describe('offline progress', () => {
  test('long offline clamps to capacity', () => {
    const state = clone(baseState)
    state.buildings.fastFarm = { resource: 'food', rate: 1000 }
    const { state: next } = applyOfflineProgress(state, 24 * 3600)
    expect(next.resources.food.amount).toBe(100)
  })

  test('parity with live ticks', () => {
    const state = clone(baseState)
    state.resources.food.capacity = 1000
    state.storage.food.base = 1000
    state.buildings.potatoField = { count: 1 }
    state.timers.food = { potatoField: 0 }

    const liveSteps = 10
    const step = 60
    let live = clone(state)
    for (let i = 0; i < liveSteps; i++) {
      live = processTick(live, step)
      live = {
        ...live,
        gameTime: { seconds: (live.gameTime?.seconds || 0) + step },
      }
    }

    const { state: off } = applyOfflineProgress(state, liveSteps * step)
    expect(Math.abs(live.resources.food.amount - off.resources.food.amount)).toBeLessThan(1e-6)
  })

  test('no negatives or NaN', () => {
    const state = clone(baseState)
    state.resources.food.amount = 10
    state.buildings.drain = { resource: 'food', rate: -5 }
    const { state: next } = applyOfflineProgress(state, 3600)
    expect(next.resources.food.amount).toBe(0)
    expect(Number.isNaN(next.resources.food.amount)).toBe(false)
  })

  test('uses dynamic capacity each step', () => {
    const state = clone(baseState)
    state.resources.food.capacity = 100
    state.storage.food.fromBuildings = 100
    state.buildings.fastFarm = { resource: 'food', rate: 10 }
    const { state: next } = applyOfflineProgress(state, 10000)
    expect(next.resources.food.amount).toBe(200)
  })
})

