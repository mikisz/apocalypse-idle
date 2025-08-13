import { describe, it, expect, vi } from 'vitest';

const fakeCandidate = { id: 'cand1' };
vi.mock('../candidates.js', () => ({
  generateCandidate: vi.fn(() => fakeCandidate),
}));

import { applyOfflineProgress } from '../offline.js';
import { generateCandidate } from '../candidates.js';

describe('applyOfflineProgress', () => {
  it('uses post-production state to update radio', () => {
    generateCandidate.mockClear();
    const state = {
      buildings: { radio: { count: 1 }, woodGenerator: { count: 1 } },
      resources: { power: { amount: 0 }, wood: { amount: 100 } },
      population: { candidate: null },
      colony: { radioTimer: 3 },
    };
    const { state: next } = applyOfflineProgress(state, 5);
    expect(generateCandidate).toHaveBeenCalledOnce();
    expect(next.population.candidate).toEqual(fakeCandidate);
    expect(next.colony.radioTimer).toBe(0);
  });

  it('returns resource gains for production while offline', () => {
    const state = {
      buildings: { woodGenerator: { count: 1 } },
      resources: { power: { amount: 0 }, wood: { amount: 100 } },
      population: { candidate: null },
      colony: { radioTimer: 0 },
    };
    const { gains } = applyOfflineProgress(state, 5);
    expect(gains.power).toBeGreaterThan(0);
  });

  it('does not consume or produce when buildings are off', () => {
    const state = {
      buildings: { woodGenerator: { count: 1, isDesiredOn: false } },
      resources: { power: { amount: 0 }, wood: { amount: 100 } },
      population: { candidate: null },
      colony: { radioTimer: 0 },
    };
    const { state: next, gains } = applyOfflineProgress(state, 5);
    expect(next.resources.wood.amount).toBe(100);
    expect(next.resources.power.amount).toBe(0);
    expect(gains).toEqual({});
  });

  it('handles shortages the same as online', () => {
    const state = {
      buildings: { woodGenerator: { count: 1 } },
      resources: { power: { amount: 0 }, wood: { amount: 0 } },
      population: { candidate: null },
      colony: { radioTimer: 0 },
    };
    const { state: next, gains } = applyOfflineProgress(state, 5);
    expect(next.resources.wood.amount).toBe(0);
    expect(next.resources.power.amount).toBe(0);
    expect(next.buildings.woodGenerator.offlineReason).toBe('resources');
    expect(gains).toEqual({});
  });
});
