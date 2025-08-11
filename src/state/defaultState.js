import { makeRandomSettler } from '../data/names.js'
import { initSeasons } from '../engine/time.js'

export const defaultState = {
  gameTime: { seconds: 0 },
  meta: { seasons: initSeasons() },
  ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
  resources: { scrap: 0, food: 0 },
  population: { settlers: [makeRandomSettler()] },
  buildings: {},
  log: [],
  lastSaved: Date.now(),
}
