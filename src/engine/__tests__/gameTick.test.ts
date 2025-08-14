import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../production.js', () => ({
  processTick: vi.fn(),
}));
vi.mock('../research.js', () => ({
  processResearchTick: vi.fn(),
}));
vi.mock('../settlers.js', () => ({
  processSettlersTick: vi.fn(),
  computeRoleBonuses: vi.fn(),
}));
vi.mock('../../state/selectors.js', () => ({
  getResourceRates: vi.fn(),
  calculateFoodCapacity: vi.fn(),
}));
vi.mock('../../data/resources.js', () => ({
  RESOURCES: {},
}));
vi.mock('../radio.js', () => ({
  updateRadio: vi.fn(),
}));
vi.mock('../time.js', () => ({
  getYear: vi.fn(),
  DAYS_PER_YEAR: 365,
}));

import { applyProduction, applySettlers, applyYearUpdate } from '../gameTick.ts';
import { processTick } from '../production.js';
import { processResearchTick } from '../research.js';
import { processSettlersTick, computeRoleBonuses } from '../settlers.js';
import { getResourceRates, calculateFoodCapacity } from '../../state/selectors.js';
import { updateRadio } from '../radio.js';
import { getYear, DAYS_PER_YEAR } from '../time.js';
import { RESOURCES } from '../../data/resources.js';

beforeEach(() => {
  vi.clearAllMocks();
  for (const key of Object.keys(RESOURCES)) delete (RESOURCES as any)[key];
});

describe('applyProduction', () => {
  it('calculates bonuses and adds farmer bonus after consumption', () => {
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

    const roleBonuses = { farmer: 0.1, builder: 0.05 };
    const result = applyProduction({ population: { settlers: [] } }, 1, roleBonuses);

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

    const result = applyProduction({ population: { settlers: [] } }, 1, {
      farmer: 1,
    });

    expect(result.state.resources.potatoes.amount).toBe(100);
  });
});

describe('applySettlers', () => {
  it('processes settlers tick', () => {
    (computeRoleBonuses as any).mockReturnValue({ farmer: 0.2 });
    (processSettlersTick as any).mockReturnValue({
      state: 'settlersProcessed',
      telemetry: 'tele',
    });
    const rng = () => 0.5;
    const result = applySettlers({ population: { settlers: [] } }, 1, rng);
    expect(computeRoleBonuses).toHaveBeenCalledWith([]);
    expect(processSettlersTick).toHaveBeenCalledWith(
      { population: { settlers: [] } },
      1,
      0,
      rng,
      { farmer: 0.2 },
    );
    expect(result).toEqual({
      state: 'settlersProcessed',
      telemetry: 'tele',
      roleBonuses: { farmer: 0.2 },
    });
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
