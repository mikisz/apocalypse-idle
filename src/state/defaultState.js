import { makeRandomSettler } from '../data/names.js'
import { initSeasons } from '../engine/time.js'
import { SCHEMA_VERSION } from '../engine/persistence.js'

export const defaultState = {
  schemaVersion: SCHEMA_VERSION,
  gameTime: { seconds: 0, year: 1 },
  meta: { seasons: initSeasons() },
  ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
  resources: {
    scrap: { amount: 0, capacity: 0 },
    food: { amount: 0, capacity: 100 },
    wood: { amount: 0, capacity: 100 },
  },
  storage: {
    food: { base: 100, fromBuildings: 0 },
    wood: { base: 100, fromBuildings: 0 },
  },
  population: { settlers: [makeRandomSettler()] },
  buildings: {
    potatoField: { count: 1 },
    loggingCamp: { count: 1 },
  },
  timers: { food: { potatoField: 5 }, wood: { loggingCamp: 2 } },
  log: [],
  lastSaved: Date.now(),
}
