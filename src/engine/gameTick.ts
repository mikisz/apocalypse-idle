import { processTick } from './production.ts';
import { processResearchTick } from './research.ts';
import { getResourceRates, calculateFoodCapacity } from '../state/selectors.js';
import { RESOURCES } from '../data/resources.js';
import { processSettlersTick, computeRoleBonuses } from './settlers.ts';
import { updateRadio } from './radio.ts';
import { getYear, DAYS_PER_YEAR } from './time.ts';
import type { GameState } from '../state/useGame.tsx';
import type { RoleBonusMap } from './settlers.ts';
import type { TickTelemetry, TickEvents } from './gameTick.types.ts';
import type { Settler } from './candidates.ts';

export function applyProduction(
  prev: GameState,
  dt: number,
  roleBonuses: RoleBonusMap,
): { state: GameState; roleBonuses: RoleBonusMap; bonusFoodPerSec: number } {
  const productionBonuses: RoleBonusMap = { ...roleBonuses };
  const farmerBonus = productionBonuses.farmer || 0;
  delete productionBonuses.farmer;

  const afterTick = processTick(prev, dt, productionBonuses);
  const withResearch = processResearchTick(afterTick, dt, roleBonuses);

  const rates = getResourceRates(withResearch);
  let totalFoodProdBase = 0;
  const resourceMap = RESOURCES as Record<string, any>;
  Object.keys(resourceMap).forEach((id) => {
    if (resourceMap[id].category === 'FOOD') {
      totalFoodProdBase += rates[id]?.perSec || 0;
    }
  });
  const bonusFoodPerSec = totalFoodProdBase * farmerBonus;

  let state: GameState = withResearch;
  if (bonusFoodPerSec) {
    const foodCapacity = calculateFoodCapacity(withResearch);
    const currentPool = withResearch.foodPool?.amount || 0;
    const room = Math.max(0, foodCapacity - currentPool);
    const bonusGain = Math.min(bonusFoodPerSec * dt, room);
    if (bonusGain > 0) {
      const currentEntry = withResearch.resources?.potatoes || {
        amount: 0,
        discovered: false,
        produced: 0,
      };
      const nextAmount = currentEntry.amount + bonusGain;
      state = {
        ...withResearch,
        resources: {
          ...withResearch.resources,
          potatoes: {
            ...currentEntry,
            amount: nextAmount,
            discovered: currentEntry.discovered || nextAmount > 0,
          },
        },
        foodPool: { amount: currentPool + bonusGain, capacity: foodCapacity },
      };
    }
  }

  return { state, roleBonuses, bonusFoodPerSec };
}

export function applySettlers(
  state: GameState,
  dt: number,
  rng = Math.random,
): {
  state: GameState;
  telemetry: TickTelemetry;
  events: TickEvents;
  roleBonuses: RoleBonusMap;
} {
  const roleBonuses = computeRoleBonuses(state.population?.settlers || []);
  const result = processSettlersTick(state, dt, 0, rng, roleBonuses) as {
    state: GameState;
    telemetry: TickTelemetry;
    events?: TickEvents;
  };
  return {
    ...result,
    events: result.events || [],
    roleBonuses,
  };
}

export function applyYearUpdate(
  state: GameState,
  dt: number,
  telemetry: TickTelemetry,
): GameState {
  const { candidate, radioTimer } = updateRadio(state, dt);
  const nextSeconds = (state.gameTime?.seconds || 0) + dt;
  const computedYear = getYear({
    ...state,
    gameTime: { ...state.gameTime, seconds: nextSeconds },
  });
  let year = (state.gameTime as any)?.year || 1;
  let settlers: GameState['population']['settlers'] = state.population.settlers;
  if (computedYear > year) {
    const diff = computedYear - year;
    year = computedYear;
    settlers = settlers.map((s: Settler) => ({
      ...s,
      ageDays: (s.ageDays || 0) + diff * DAYS_PER_YEAR,
    })) as GameState['population']['settlers'];
  }
  return {
    ...state,
    population: { ...state.population, settlers, candidate } as GameState['population'],
    colony: { ...state.colony, radioTimer } as GameState['colony'],
    gameTime: { seconds: nextSeconds, year } as GameState['gameTime'],
    meta: {
      ...state.meta,
      telemetry: {
        ...(state.meta as any)?.telemetry,
        settlers: telemetry,
      },
    } as GameState['meta'],
  } as GameState;
}

