import { defaultState } from './defaultState.js';
import { getYear, initSeasons, SECONDS_PER_DAY } from '../engine/time.js';
import { computeRoleBonuses } from '../engine/settlers.js';
import { applyOfflineProgress } from '../engine/production.js';
import { createLogEntry } from '../utils/log.js';
import { RESOURCES } from '../data/resources.js';
import { formatAmount } from '../utils/format.js';
import { buildInitialPowerTypeOrder } from '../engine/power.js';

/* eslint-disable-next-line react-refresh/only-export-components */
export function prepareLoadedState(loaded: any) {
  const cloned = structuredClone(loaded || {});
  const gameTime =
    typeof cloned.gameTime === 'number'
      ? { seconds: cloned.gameTime }
      : cloned.gameTime || { seconds: 0 };
  const base = structuredClone(defaultState);
  base.version = cloned.version ?? base.version;
  base.gameTime = { ...base.gameTime, ...gameTime };
  base.meta = { ...base.meta, ...cloned.meta, seasons: initSeasons() };
  base.ui = { ...base.ui, ...cloned.ui };
  base.resources = { ...base.resources, ...cloned.resources };
  base.buildings = { ...base.buildings, ...cloned.buildings };
  base.powerTypeOrder = buildInitialPowerTypeOrder(cloned.powerTypeOrder || []);
  base.research = { ...base.research, ...cloned.research };
  base.population = { ...base.population, ...cloned.population };
  if (Array.isArray(cloned.population?.settlers)) {
    base.population.settlers = cloned.population.settlers.map((s: any) => ({
      ...s,
    }));
  }
  base.colony = { ...base.colony, ...cloned.colony };
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
    const { state: progressed, gains } = applyOfflineProgress(
      base,
      elapsed,
      bonuses,
    );
    const offlineLogs = Object.entries(gains).map(([res, amt]) =>
      createLogEntry(
        `Gained ${formatAmount(amt)} ${RESOURCES[res].name} while offline`,
        now,
      ),
    );
    const secondsAfter = (progressed.gameTime?.seconds || 0) + elapsed;
    const yearAfter = getYear({
      ...progressed,
      gameTime: { ...progressed.gameTime, seconds: secondsAfter },
    });
    const settlers = progressed.population.settlers.map((s: any) => ({
      ...s,
      ageDays: (s.ageDays || 0) + elapsed / SECONDS_PER_DAY,
    }));
    const show = Object.keys(gains).length > 0;
    const log = [...offlineLogs, ...(progressed.log || [])].slice(0, 100);
    return {
      ...progressed,
      population: { ...progressed.population, settlers },
      gameTime: { seconds: secondsAfter, year: yearAfter },
      ui: {
        ...progressed.ui,
        offlineProgress: show ? { elapsed, gains } : null,
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
