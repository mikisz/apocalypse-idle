import { makeRandomSettler } from '../data/names.js'

export const defaultState = {
  gameTime: 0,
  ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
  resources: { scrap: 0, food: 0 },
  population: { settlers: [makeRandomSettler()] },
  buildings: {},
  log: [],
  lastSaved: Date.now(),
}
