import { describe, it, expect } from 'vitest';
import { getResourceRates, getResourceSections, getPowerStatus } from '../selectors.js';

describe('getResourceRates', () => {
  it('ignores buildings that are turned off', () => {
    const state = {
      resources: { wood: { amount: 0 } },
      buildings: { loggingCamp: { count: 1, isDesiredOn: false } },
      population: { settlers: [] },
      research: { completed: [] },
    };
    const rates = getResourceRates(state);
    expect(rates.wood.perSec).toBe(0);
  });
});

describe('power selectors', () => {
  it('returns power status when present', () => {
    const state = {
      powerStatus: { supply: 1, demand: 2, stored: 3, capacity: 4 },
    };
    const ps = getPowerStatus(state);
    expect(ps).toEqual({ supply: 1, demand: 2, stored: 3, capacity: 4 });
  });

  it('uses fallbacks when power status is missing', () => {
    const state = {
      resources: { power: { amount: 5 } },
      buildings: {},
      research: { completed: [] },
    };
    const ps = getPowerStatus(state);
    expect(ps).toEqual({ supply: 0, demand: 0, stored: 5, capacity: 20 });
  });

  it('handles old saves without power resource', () => {
    const state = { resources: {}, buildings: {}, research: { completed: [] } };
    const ps = getPowerStatus(state);
    expect(ps).toEqual({ supply: 0, demand: 0, stored: 0, capacity: 20 });
  });

  it('injects power status into energy section', () => {
    const state = {
      resources: { power: { amount: 3, discovered: true } },
      buildings: {},
      research: { completed: ['basicEnergy'] },
      population: { settlers: [] },
      gameTime: { seconds: 0 },
      powerStatus: { supply: 2, demand: 1, stored: 3, capacity: 10 },
    };
    const sections = getResourceSections(state);
    const energy = sections.find((s) => s.title === 'Energy');
    const row = energy.items.find((i) => i.id === 'power');
    expect(row.supply).toBe(2);
    expect(row.demand).toBe(1);
    expect(row.amount).toBe(3);
    expect(row.capacity).toBe(10);
  });
});
