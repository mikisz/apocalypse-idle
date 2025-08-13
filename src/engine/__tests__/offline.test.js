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
});
