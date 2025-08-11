import { makeRandomSettler } from '../data/names.js'
import { initSeasons } from '../engine/time.js'

export const defaultState = {
  gameTime: { seconds: 0, year: 1 },
  meta: { seasons: initSeasons() },
  ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
  resources: {
    scrap: { amount: 0, capacity: 0 },
    food: { amount: 0, capacity: 100 },
  },
  storage: {
    food: { base: 100, fromBuildings: 0 },
  },
  population: { settlers: [makeRandomSettler()] },
  buildings: {},
  timers: { food: {} },
  log: [],
  lastSaved: Date.now(),
}
