import { describe, test, expect, vi, beforeEach } from 'vitest'
import { applyOfflineProgress, processTick } from '../production.js'
import * as time from '../time.js'
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
    state.buildings.potatoField = { count: 1 }
    state.timers.food = { potatoField: 0 }
    const { state: next } = applyOfflineProgress(state, 100000)
    expect(next.resources.food.amount).toBe(getCapacity(next, 'food'))
  })

  test('parity with live ticks', () => {
    const state = clone(baseState)
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
})
