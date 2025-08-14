// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';

const fakeCandidate = { id: 'cand1' };
vi.mock('../candidates.ts', () => ({
  generateCandidate: vi.fn(() => fakeCandidate),
}));

import { applyOfflineProgress } from '../offline.ts';
import { generateCandidate } from '../candidates.ts';
import { processTick } from '../production.ts';
import { RESEARCH_MAP } from '../../data/research.js';

const createRng =
  (seed = 1) =>
  () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

describe('applyOfflineProgress', () => {
  it('uses post-production state to update radio and emits event', () => {
    generateCandidate.mockClear();
    const rng = createRng();
    const state = {
      buildings: { radio: { count: 1 }, woodGenerator: { count: 1 } },
      resources: { power: { amount: 0 }, wood: { amount: 100 } },
      population: { candidate: null },
      colony: { radioTimer: 3 },
    };
    const { state: next, events } = applyOfflineProgress(state, 5, {}, rng);
    expect(generateCandidate).toHaveBeenCalledOnce();
    expect(next.population.candidate).toEqual(fakeCandidate);
    expect(next.colony.radioTimer).toBe(0);
    const evt = events.find((e) => e.type === 'candidate');
    expect(evt?.text).toBe('Someone responded to the radio');
  });

  it('returns resource gains for production while offline', () => {
    const rng = createRng(2);
    const state = {
      buildings: { woodGenerator: { count: 1 } },
      resources: { power: { amount: 0 }, wood: { amount: 100 } },
      population: { candidate: null },
      colony: { radioTimer: 0 },
    };
    const { gains } = applyOfflineProgress(state, 5, {}, rng);
    expect(gains.power).toBeGreaterThan(0);
  });

  it('does not consume or produce when buildings are off', () => {
    const rng = createRng(3);
    const state = {
      buildings: { woodGenerator: { count: 1, isDesiredOn: false } },
      resources: { power: { amount: 0 }, wood: { amount: 100 } },
      population: { candidate: null },
      colony: { radioTimer: 0 },
    };
    const { state: next, gains } = applyOfflineProgress(state, 5, {}, rng);
    expect(next.resources.wood.amount).toBe(100);
    expect(next.resources.power.amount).toBe(0);
    expect(gains).toEqual({});
  });

  it('handles shortages the same as online', () => {
    const rng = createRng(4);
    const state = {
      buildings: { woodGenerator: { count: 1 } },
      resources: { power: { amount: 0 }, wood: { amount: 0 } },
      population: { candidate: null },
      colony: { radioTimer: 0 },
    };
    const { state: next, gains } = applyOfflineProgress(state, 5, {}, rng);
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
    const rng = createRng(5);
    const { state: offline } = applyOfflineProgress(
      createState(),
      seconds,
      {},
      rng,
    );
    let online = createState();
    for (let i = 0; i < seconds; i += 1) {
      online = processTick(online, 1);
    }
    expect(offline.resources.power).toEqual(online.resources.power);
    expect(offline.powerStatus).toEqual(online.powerStatus);
  });

  it('completes research and logs event while offline', () => {
    const id = 'industry1';
    const state: any = {
      buildings: {},
      resources: {},
      research: { current: { id }, completed: [], progress: { [id]: 0 } },
      population: { settlers: [], candidate: null },
      colony: { radioTimer: 0, starvationTimerSeconds: 0 },
      log: [],
    };
    const seconds = RESEARCH_MAP[id].timeSec + 5;
    const { state: next, events } = applyOfflineProgress(state, seconds, {});
    expect(next.research.current).toBe(null);
    expect(next.research.completed).toContain(id);
    const evt = events.find((e: any) => e.type === 'research');
    expect(evt?.text).toContain(RESEARCH_MAP[id].name);
  });
});
