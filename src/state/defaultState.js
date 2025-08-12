import { initSeasons } from '../engine/time.js';
import { CURRENT_SAVE_VERSION } from '../engine/persistence.js';
import { RESOURCES } from '../data/resources.js';
import { BUILDINGS } from '../data/buildings.js';
import { makeRandomSettler } from '../data/names.js';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import { BALANCE } from '../data/balance.js';

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
  shelter: { count: 1 },
});

const initPowerTypePriority = () => {
  const result = {};
  const orderCounters = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  BUILDINGS.forEach((b) => {
    if (!b.inputsPerSecBase?.power && !b.poweredMode) return;
    let priority = 1;
    if (b.category === 'Food') priority = 5;
    else if (b.type === 'processing') priority = 3;
    else if (b.category === 'Raw Materials') priority = 2;
    const order = orderCounters[priority]++;
    result[b.id] = { priority, order };
  });
  return result;
};

const initSettlers = () => [makeRandomSettler()];

const initColony = () => ({
  starvationTimerSeconds: 0,
  radioTimer: RADIO_BASE_SECONDS,
  happiness: {
    value: BALANCE.HAPPINESS_BASE,
    breakdown: [{ label: 'Base', value: BALANCE.HAPPINESS_BASE }],
  },
});

const initResearch = () => ({ current: null, completed: [], progress: {} });

export const defaultState = {
  version: CURRENT_SAVE_VERSION,
  gameTime: { seconds: 0 },
  meta: { seasons: initSeasons() },
  ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
  resources: initResources(),
  buildings: initBuildings(),
  powerTypePriority: initPowerTypePriority(),
  research: initResearch(),
  population: { settlers: initSettlers(), candidate: null },
  colony: initColony(),
  log: [],
  lastSaved: Date.now(),
};
