import { initSeasons } from '../engine/time.js';
import { CURRENT_SAVE_VERSION } from '../engine/persistence.js';
import { RESOURCES } from '../data/resources.js';
import { makeRandomSettler } from '../data/names.js';

const initResources = () => {
  const obj = {};
  Object.values(RESOURCES).forEach((r) => {
    obj[r.id] = { amount: r.startingAmount || 0 };
  });
  return obj;
};

const initBuildings = () => ({
  potatoField: { count: 1 },
  loggingCamp: { count: 1 },
});

export const defaultState = {
  version: CURRENT_SAVE_VERSION,
  gameTime: { seconds: 0 },
  meta: { seasons: initSeasons() },
  ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
  resources: initResources(),
  buildings: initBuildings(),
  population: { settlers: [makeRandomSettler()] },
  log: [],
  lastSaved: Date.now(),
};
