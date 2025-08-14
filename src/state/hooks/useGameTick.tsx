/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dispatch, SetStateAction } from 'react';
import useGameLoop from '../../engine/useGameLoop.tsx';
import { processTick } from '../../engine/production.js';
import { processResearchTick } from '../../engine/research.js';
import { getResourceRates, getFoodCapacity } from '../selectors.js';
import { RESOURCES } from '../../data/resources.js';
import {
  processSettlersTick,
  computeRoleBonuses,
} from '../../engine/settlers.js';
import { updateRadio } from '../../engine/radio.js';
import { getYear, DAYS_PER_YEAR } from '../../engine/time.js';

export function applyProduction(prev: any, dt: number) {
  const roleBonuses = computeRoleBonuses(prev.population?.settlers || []);
  const productionBonuses = { ...roleBonuses };
  const farmerBonus = productionBonuses.farmer || 0;
  delete productionBonuses.farmer;

  const afterTick = processTick(prev, dt, productionBonuses);
  const withResearch = processResearchTick(afterTick, dt, roleBonuses);

  const rates = getResourceRates(withResearch);
  let totalFoodProdBase = 0;
  Object.keys(RESOURCES).forEach((id) => {
    if (RESOURCES[id].category === 'FOOD') {
      totalFoodProdBase += rates[id]?.perSec || 0;
    }
  });
  const bonusFoodPerSec = totalFoodProdBase * farmerBonus;

  let state = withResearch;
  if (bonusFoodPerSec) {
    const foodCapacity = getFoodCapacity(withResearch);
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

export function applySettlers(state: any, dt: number, rng = Math.random) {
  return processSettlersTick(state, dt, 0, rng, null);
}

export function applyYearUpdate(state: any, dt: number, telemetry: any) {
  const { candidate, radioTimer } = updateRadio(state, dt);
  const nextSeconds = (state.gameTime?.seconds || 0) + dt;
  const computedYear = getYear({
    ...state,
    gameTime: { ...state.gameTime, seconds: nextSeconds },
  });
  let year = state.gameTime?.year || 1;
  let settlers = state.population.settlers;
  if (computedYear > year) {
    const diff = computedYear - year;
    year = computedYear;
    settlers = settlers.map((s: any) => ({
      ...s,
      ageDays: (s.ageDays || 0) + diff * DAYS_PER_YEAR,
    }));
  }
  return {
    ...state,
    population: { ...state.population, settlers, candidate },
    colony: { ...state.colony, radioTimer },
    gameTime: { seconds: nextSeconds, year },
    meta: {
      ...state.meta,
      telemetry: {
        ...state.meta?.telemetry,
        settlers: telemetry,
      },
    },
  };
}

export default function useGameTick(setState: Dispatch<SetStateAction<any>>) {
  useGameLoop((dt) => {
    setState((prev) => {
      const { state: settlersProcessed, telemetry } = applySettlers(prev, dt);
      const {
        state: withProduction,
        bonusFoodPerSec,
      } = applyProduction(settlersProcessed, dt);
      const updatedTelemetry = {
        ...telemetry,
        bonusFoodPerSec,
        netFoodPerSec: (telemetry.netFoodPerSec || 0) + bonusFoodPerSec,
      };
      return applyYearUpdate(withProduction, dt, updatedTelemetry);
    });
  }, 1000);
}
