import { defaultState } from './defaultState.js';
import { getYear, initSeasons, SECONDS_PER_DAY } from '../engine/time.js';
import { computeRoleBonuses } from '../engine/settlers.js';
import { applyOfflineProgress } from '../engine/offline.js';
import { createLogEntry } from '../utils/log.js';
import { RESOURCES } from '../data/resources.js';
import { formatAmount } from '../utils/format.js';
import { buildInitialPowerTypeOrder } from '../engine/power.js';
import { deepClone } from '../utils/clone.ts';
import { calculateFoodCapacity } from './selectors.js';

/* eslint-disable-next-line react-refresh/only-export-components */
export function prepareLoadedState(loaded: any) {
  const cloned = deepClone(loaded || {});
  const gameTime =
    typeof cloned.gameTime === 'number'
      ? { seconds: cloned.gameTime }
      : cloned.gameTime || { seconds: 0 };
  const base = deepClone(defaultState);
  base.version = cloned.version ?? base.version;
  base.gameTime = { ...base.gameTime, ...gameTime };
  base.meta = { ...base.meta, ...cloned.meta, seasons: initSeasons() };
  base.ui = { ...base.ui, ...cloned.ui };
  base.resources = { ...base.resources, ...cloned.resources };
  base.buildings = { ...base.buildings, ...cloned.buildings };
  Object.values(base.buildings).forEach((b: any) => {
    if (typeof b.isDesiredOn !== 'boolean') b.isDesiredOn = true;
  });
  base.powerTypeOrder = buildInitialPowerTypeOrder(cloned.powerTypeOrder || []);
  base.research = { ...base.research, ...cloned.research };
  const foodAmount = Object.keys(RESOURCES).reduce((sum, id) => {
    if (RESOURCES[id].category === 'FOOD') {
      return sum + (base.resources[id]?.amount || 0);
    }
    return sum;
  }, 0);
  const foodCapacity = calculateFoodCapacity(base);
  base.foodPool = { amount: foodAmount, capacity: foodCapacity };
  base.population = { ...base.population, ...cloned.population };
  if (Array.isArray(cloned.population?.settlers)) {
    base.population.settlers = cloned.population.settlers.map((s: any) => ({
      ...s,
    }));
  }
  base.colony = { ...base.colony, ...cloned.colony };
  base.powerStatus = {
    supply: 0,
    demand: 0,
    stored: 0,
    capacity: 0,
    ...cloned.powerStatus,
  };
  if (Array.isArray(cloned.log)) {
    base.log = [...cloned.log];
  }
  base.lastSaved = cloned.lastSaved ?? base.lastSaved;
  const prevYear = base.gameTime.year || getYear(base);
  base.gameTime.year = prevYear;
  const now = Date.now();
  const elapsed = Math.floor((now - (cloned.lastSaved || now)) / 1000);
  if (elapsed > 0) {
    const bonuses = computeRoleBonuses(base.population?.settlers || []);
    const { state: progressed, gains, events } = applyOfflineProgress(
      base,
      elapsed,
      bonuses,
    );
    const resourceLogs = Object.entries(gains).map(([res, amt]) =>
      createLogEntry(
        `Gained ${formatAmount(amt)} ${RESOURCES[res].name} while offline`,
        now,
      ),
    );
    const deathLogs = events || [];
    const secondsAfter = (progressed.gameTime?.seconds || 0) + elapsed;
    const yearAfter = getYear({
      ...progressed,
      gameTime: { ...progressed.gameTime, seconds: secondsAfter },
    });
    const settlers = progressed.population.settlers.map((s: any) => ({
      ...s,
      ageDays: (s.ageDays || 0) + elapsed / SECONDS_PER_DAY,
    }));
    const show = Object.keys(gains).length > 0 || deathLogs.length > 0;
    const log = [...resourceLogs, ...(progressed.log || [])].slice(0, 100);
    return {
      ...progressed,
      population: { ...progressed.population, settlers },
      gameTime: { seconds: secondsAfter, year: yearAfter },
      ui: {
        ...progressed.ui,
        offlineProgress: show
          ? { elapsed, gains, deaths: deathLogs.map((e) => e.text) }
          : null,
      },
      log,
      lastSaved: now,
    };
  }
  return {
    ...base,
    gameTime: { ...base.gameTime, year: prevYear },
    lastSaved: now,
  };
}
