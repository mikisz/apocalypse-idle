import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../engine/production.js', () => ({
  processTick: vi.fn(),
}));
vi.mock('../../../engine/research.js', () => ({
  processResearchTick: vi.fn(),
}));
vi.mock('../../../engine/settlers.js', () => ({
  processSettlersTick: vi.fn(),
  computeRoleBonuses: vi.fn(),
}));
vi.mock('../../selectors.js', () => ({
  getResourceRates: vi.fn(),
  calculateFoodCapacity: vi.fn(),
}));
vi.mock('../../../data/resources.js', () => ({
  RESOURCES: {},
}));
vi.mock('../../../engine/radio.js', () => ({
  updateRadio: vi.fn(),
}));
vi.mock('../../../engine/time.js', () => ({
  getYear: vi.fn(),
  DAYS_PER_YEAR: 365,
}));

import { applyProduction, applySettlers, applyYearUpdate } from '../useGameTick';
import { processTick } from '../../../engine/production.js';
import { processResearchTick } from '../../../engine/research.js';
import { processSettlersTick, computeRoleBonuses } from '../../../engine/settlers.js';
import { getResourceRates, calculateFoodCapacity } from '../../selectors.js';
import { updateRadio } from '../../../engine/radio.js';
import { getYear, DAYS_PER_YEAR } from '../../../engine/time.js';
import { RESOURCES } from '../../../data/resources.js';

beforeEach(() => {
  vi.clearAllMocks();
  for (const key of Object.keys(RESOURCES)) delete (RESOURCES as any)[key];
});

describe('applyProduction', () => {
  it('calculates bonuses and adds farmer bonus after consumption', () => {
    (computeRoleBonuses as any).mockReturnValue({ farmer: 0.1, builder: 0.05 });
    (processTick as any).mockReturnValue('after');
    (processResearchTick as any).mockReturnValue({
      resources: { potatoes: { amount: 1, produced: 0, discovered: true } },
      population: { settlers: [] },
      foodPool: { amount: 1, capacity: 100 },
    });
    (getResourceRates as any).mockReturnValue({
      potatoes: { perSec: 2 },
      metal: { perSec: 4 },
    });
    (calculateFoodCapacity as any).mockReturnValue(100);
    (RESOURCES as any).potatoes = { category: 'FOOD' };
    (RESOURCES as any).metal = { category: 'METAL' };

    const result = applyProduction({ population: { settlers: [] } }, 1);

    expect(processTick).toHaveBeenCalledWith(
      { population: { settlers: [] } },
      1,
      { builder: 0.05 },
    );
    expect(result).toEqual({
      state: {
        resources: { potatoes: { amount: 1.2, produced: 0, discovered: true } },
        population: { settlers: [] },
        foodPool: { amount: 1.2, capacity: 100 },
      },
      roleBonuses: { farmer: 0.1, builder: 0.05 },
      bonusFoodPerSec: 0.2,
    });
  });

  it('clamps bonus food to capacity', () => {
    (computeRoleBonuses as any).mockReturnValue({ farmer: 1 });
    (processTick as any).mockReturnValue('after');
    (processResearchTick as any).mockReturnValue({
      resources: { potatoes: { amount: 99.5, produced: 0, discovered: true } },
      population: { settlers: [] },
      foodPool: { amount: 99.5, capacity: 100 },
    });
    (getResourceRates as any).mockReturnValue({
      potatoes: { perSec: 1 },
    });
    (calculateFoodCapacity as any).mockReturnValue(100);
    (RESOURCES as any).potatoes = { category: 'FOOD' };

    const result = applyProduction({ population: { settlers: [] } }, 1);

    expect(result.state.resources.potatoes.amount).toBe(100);
  });
});

describe('applySettlers', () => {
  it('processes settlers tick', () => {
    (processSettlersTick as any).mockReturnValue({
      state: 'settlersProcessed',
      telemetry: 'tele',
    });
    const rng = () => 0.5;
    const result = applySettlers('stateBefore', 1, rng);
    expect(processSettlersTick).toHaveBeenCalledWith(
      'stateBefore',
      1,
      0,
      rng,
      null,
    );
    expect(result).toEqual({ state: 'settlersProcessed', telemetry: 'tele' });
  });
});

describe('applyYearUpdate', () => {
  it('updates year and ages settlers', () => {
    (updateRadio as any).mockReturnValue({
      candidate: 'cand',
      radioTimer: 5,
    });
    (getYear as any).mockReturnValue(2);
    const state = {
      gameTime: { seconds: 0, year: 1 },
      population: { settlers: [{ id: 1, ageDays: 0 }] },
      colony: {},
      meta: {},
    };
    const telemetry = { some: 'data' };
    const result = applyYearUpdate(state as any, 10, telemetry);
    expect(result.population).toMatchObject({
      settlers: [{ id: 1, ageDays: DAYS_PER_YEAR }],
      candidate: 'cand',
    });
    expect(result.colony.radioTimer).toBe(5);
    expect(result.gameTime).toEqual({ seconds: 10, year: 2 });
    expect(result.meta?.telemetry?.settlers).toBe(telemetry);
  });
});

