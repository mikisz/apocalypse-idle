import { initSeasons } from '../engine/time.js';
import { CURRENT_SAVE_VERSION } from '../engine/persistence.js';
import { RESOURCES } from '../data/resources.js';
import { buildInitialPowerTypeOrder } from '../engine/power.js';
import { makeRandomSettler } from '../data/names.js';
import { RADIO_BASE_SECONDS } from '../data/settlement.js';
import { BALANCE } from '../data/balance.js';
import { getFoodCapacity } from './selectors.js';

const initResources = () => {
  const obj = {};
  Object.values(RESOURCES).forEach((r) => {
    const amt = r.startingAmount || 0;
    obj[r.id] = { amount: amt, discovered: amt > 0, produced: 0 };
  });
  return obj;
};

const initBuildings = () => ({
  potatoField: { count: 2, isDesiredOn: true },
  loggingCamp: { count: 1, isDesiredOn: true },
  shelter: { count: 1, isDesiredOn: true },
});

const initPowerTypeOrder = () => buildInitialPowerTypeOrder([]);

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

const resources = initResources();
const buildings = initBuildings();

const initFoodPool = () => {
  let amount = 0;
  Object.values(RESOURCES).forEach((r) => {
    if (r.category === 'FOOD') {
      amount += resources[r.id]?.amount || 0;
    }
  });
  const capacity = getFoodCapacity({ resources, buildings });
  return { amount, capacity };
};

export const defaultState = {
  version: CURRENT_SAVE_VERSION,
  gameTime: { seconds: 0 },
  meta: { seasons: initSeasons() },
  ui: { activeTab: 'base', drawerOpen: false, offlineProgress: null },
  resources,
  foodPool: initFoodPool(),
  buildings,
  powerTypeOrder: initPowerTypeOrder(),
  research: initResearch(),
  population: { settlers: initSettlers(), candidate: null },
  colony: initColony(),
  log: [],
  lastSaved: Date.now(),
};
