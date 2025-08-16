// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

const fakeCandidate = { id: 'cand1' };

vi.mock('../candidates.ts', () => ({
  generateCandidate: vi.fn(() => fakeCandidate),
}));

import { updateRadio } from '../radio.ts';
import { applyProduction } from '../production.ts';
import { getResourceRates } from '../../state/selectors.js';
import { generateCandidate } from '../candidates.ts';

const baseState = {
  buildings: { radio: { count: 1 } },
  resources: { power: { amount: 1 } },
  population: { candidate: null },
  colony: { radioTimer: 10 },
};

describe('updateRadio', () => {
  it('decrements timer without creating a candidate if time remains', () => {
    const state = { ...baseState, colony: { radioTimer: 10 } };
    const { candidate, radioTimer } = updateRadio(state, 3);
    expect(candidate).toBeNull();
    expect(radioTimer).toBe(7);
  });

  it('creates candidate and resets timer when countdown completes', () => {
    const state = { ...baseState, colony: { radioTimer: 2 } };
    const { candidate, radioTimer } = updateRadio(state, 5);
    expect(generateCandidate).toHaveBeenCalledOnce();
    expect(candidate).toEqual(fakeCandidate);
    expect(radioTimer).toBe(0);
  });
});

describe('radio building production', () => {
  it('consumes power without producing resources', () => {
    const state = {
      buildings: { radio: { count: 1 } },
      resources: { power: { amount: 1 } },
    };
    const next = applyProduction(state, 5, {});
    expect(next.resources.power.amount).toBeCloseTo(0.5, 5);
  });

  it('reports power consumption in resource rates', () => {
    const state = {
      buildings: { radio: { count: 1 } },
      resources: { power: { amount: 1 } },
    };
    const rates = getResourceRates(state);
    expect(rates.power.perSec).toBeCloseTo(-0.1, 5);
  });
});

describe('buildings without inputs or outputs', () => {
  it('do not crash resource rate calculations', () => {
    const state = { buildings: { shelter: { count: 1 } }, resources: {} };
    expect(() => getResourceRates(state)).not.toThrow();
  });

  it('do not crash production calculations', () => {
    const state = { buildings: { shelter: { count: 1 } }, resources: {} };
    expect(() => applyProduction(state, 5, {})).not.toThrow();
  });
});
