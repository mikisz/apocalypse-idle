import { describe, it, expect, vi } from 'vitest';

const fakeCandidate = { id: 'cand1' };
vi.mock('../candidates.js', () => ({
  generateCandidate: vi.fn(() => fakeCandidate),
}));

import { applyOfflineProgress } from '../offline.js';
import { generateCandidate } from '../candidates.js';
import { processTick } from '../production.js';

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

  it('updates power storage like live ticks', () => {
    const createState = () => ({
      buildings: {
        woodGenerator: { count: 1 },
        toolsmithy: { count: 1 },
        battery: { count: 1 },
      },
      resources: {
        wood: { amount: 100 },
        planks: { amount: 100 },
        metalParts: { amount: 100 },
        power: { amount: 0 },
        tools: { amount: 0 },
      },
      population: { settlers: [], candidate: null },
      colony: { radioTimer: 0, starvationTimerSeconds: 0 },
    });
    const seconds = 10;
    const { state: offline } = applyOfflineProgress(createState(), seconds);
    let online = createState();
    for (let i = 0; i < seconds; i += 1) {
      online = processTick(online, 1);
    }
    expect(offline.resources.power).toEqual(online.resources.power);
    expect(offline.powerStatus).toEqual(online.powerStatus);
  });
});
