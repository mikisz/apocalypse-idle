import { describe, it, expect, vi } from 'vitest';

const createBaseState = () => ({
  buildings: { woodGenerator: { count: 1 }, radio: { count: 1 } },
  resources: {
    wood: { amount: 50, discovered: true, produced: 0 },
    power: { amount: 0, discovered: false, produced: 0 },
    potatoes: { amount: 0, discovered: false, produced: 0 },
  },
  population: { settlers: [], candidate: null },
  colony: { radioTimer: 0, starvationTimerSeconds: 0 },
});

describe('offline progress', () => {
  it('invokes processTick once per elapsed second', async () => {
    const mock = vi.fn((state) => state);
    vi.doMock('../production.js', () => ({ processTick: mock }));
    const { applyOfflineProgress } = await import('../offline.js');
    applyOfflineProgress(createBaseState(), 5);
    expect(mock).toHaveBeenCalledTimes(5);
    vi.doUnmock('../production.js');
    vi.resetModules();
  });

  it('matches online ticks for storage and power status', async () => {
    const { applyOfflineProgress } = await import('../offline.js');
    const { processTick } = await import('../production.js');
    const offline = applyOfflineProgress(createBaseState(), 100).state;
    let online = createBaseState();
    for (let i = 0; i < 100; i += 1) {
      online = processTick(online, 1);
    }
    expect(offline.resources).toEqual(online.resources);
    expect(offline.powerStatus).toEqual(online.powerStatus);
  });
});

