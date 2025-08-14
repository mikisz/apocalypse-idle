import { describe, it, expect, vi } from 'vitest';

const createBaseState = () => ({
  buildings: { woodGenerator: { count: 1 }, radio: { count: 1 } },
  resources: {
    wood: { amount: 5000, discovered: true, produced: 0 },
    power: { amount: 0, discovered: false, produced: 0 },
    potatoes: { amount: 0, discovered: false, produced: 0 },
  },
  population: { settlers: [], candidate: null },
  colony: { radioTimer: 0, starvationTimerSeconds: 0 },
});

describe('offline progress', () => {
  it('invokes processTick in large chunks', async () => {
    const mock = vi.fn((state, secs) => state);
    vi.doMock('../production.js', () => ({ processTick: mock }));
    const { applyOfflineProgress } = await import('../offline.js');
    applyOfflineProgress(createBaseState(), 3600);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(expect.any(Object), 3600, expect.any(Object));
    vi.doUnmock('../production.js');
    vi.resetModules();
  });

});

