import { initSeasons } from '../engine/time.js';
import { CURRENT_SAVE_VERSION } from '../engine/persistence.js';
import { RESOURCES } from '../data/resources.js';
import { makeRandomSettler } from '../data/names.js';

const initResources = () => {
  const obj = {};
  Object.values(RESOURCES).forEach((r) => {
    const amt = r.startingAmount || 0;
    obj[r.id] = { amount: amt, discovered: amt > 0, produced: 0 };
  });
  return obj;
};

const initBuildings = () => ({
  potatoField: { count: 2 },
  loggingCamp: { count: 1 },
});

const initSettlers = () => [makeRandomSettler()];

const initResearch = () => ({ current: null, completed: [], progress: {} });

export const defaultState = {
  version: CURRENT_SAVE_VERSION,
  gameTime: { seconds: 0 },
  meta: { seasons: initSeasons() },
  ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
  resources: initResources(),
  buildings: initBuildings(),
  research: initResearch(),
  population: { settlers: initSettlers() },
  log: [],
  lastSaved: Date.now(),
};
