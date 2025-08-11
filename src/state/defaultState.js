import { makeRandomSettler } from '../data/names.js'
import { initSeasons } from '../engine/time.js'
import { CURRENT_SAVE_VERSION } from '../engine/persistence.js'
import { RESOURCES } from '../data/resources.js'
import { BUILDINGS } from '../data/buildings.js'

const initResources = () => {
  const obj = {}
  Object.keys(RESOURCES).forEach((id) => {
    obj[id] = { amount: 0 }
  })
  return obj
}

const initBuildings = () => {
  const obj = {}
  BUILDINGS.forEach((b) => {
    if (b.startsWithCount) obj[b.id] = { count: b.startsWithCount }
  })
  return obj
}

const initTimers = () => {
  const timers = {}
  BUILDINGS.forEach((b) => {
    if (b.startsWithCount > 0 && b.cycleTimeSec) {
      const group = timers[b.outputResource] || {}
      group[b.id] = b.cycleTimeSec
      timers[b.outputResource] = group
    }
  })
  return timers
}

export const defaultState = {
  version: CURRENT_SAVE_VERSION,
  gameTime: { seconds: 0, year: 1 },
  meta: { seasons: initSeasons() },
  ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
  resources: initResources(),
  colony: {
    foodStorage: 0,
    foodStorageCap: RESOURCES.food.baseCapacity,
    starvationTimerSeconds: 0,
  },
  population: { settlers: [makeRandomSettler()] },
  buildings: initBuildings(),
  timers: initTimers(),
  log: [],
  lastSaved: Date.now(),
}
