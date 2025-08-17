import { describe, it, expect, vi } from 'vitest';
import { getResourceRates } from '../../state/selectors.js';
import { processSettlersTick } from '../settlers.ts';
import { RESOURCES } from '../../data/resources.js';
import type { GameState, ResourceState } from '../../state/useGame.tsx';

type TestGameState = GameState & { resources: Record<string, ResourceState> };

const createBaseState = (): TestGameState =>
  ({
    buildings: { woodGenerator: { count: 1 }, radio: { count: 1 } },
    resources: {
      wood: { amount: 50, discovered: true, produced: 0 } as ResourceState,
      power: { amount: 0, discovered: false, produced: 0 } as ResourceState,
      potatoes: { amount: 0, discovered: false, produced: 0 } as ResourceState,
    },
    population: { settlers: [], candidate: null },
    colony: { radioTimer: 0, starvationTimerSeconds: 0 },
  }) as TestGameState;

const createRng =
  (seed = 1): (() => number) =>
  () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

describe('offline progress', () => {
  it('invokes processTick in larger chunks', async () => {
    const mock = vi.fn<
      (
        state: TestGameState,
        seconds?: number,
        roleBonuses?: Record<string, number>,
      ) => TestGameState
    >((state) => state);
    vi.doMock('../production.ts', () => ({ processTick: mock }));
    const { applyOfflineProgress } = await import('../offline.ts');
    applyOfflineProgress(createBaseState(), 5, {}, createRng());
    expect(mock).toHaveBeenCalledTimes(1);
    vi.doUnmock('../production.ts');
    vi.resetModules();
  });

  it('matches online ticks for storage and power status', async () => {
    const { applyOfflineProgress } = await import('../offline.ts');
    const { processTick } = await import('../production.ts');
    const offline = applyOfflineProgress(
      createBaseState(),
      100,
      {},
      createRng(2),
    ).state as TestGameState;
    let online = createBaseState();
    for (let i = 0; i < 100; i += 1) {
      online = processTick(online, 1);
    }
    expect(offline.resources).toEqual(online.resources);
    expect(offline.powerStatus).toEqual(online.powerStatus);
  });

  it('matches per-second simulation over multiple hours', async () => {
    const { applyOfflineProgress } = await import('../offline.ts');
    const { processTick } = await import('../production.ts');
    const base: Partial<TestGameState> = {
      buildings: { potatoField: { count: 2 }, largeGranary: { count: 100 } },
      resources: {
        potatoes: { amount: 0, discovered: true, produced: 0 } as ResourceState,
      },
      population: {
        settlers: [
          { id: 's1', isDead: false, role: null },
        ] as unknown as TestGameState['population']['settlers'],
        candidate: null,
      },
      colony: { radioTimer: 0, starvationTimerSeconds: 0 },
    };
    const seconds = 3 * 3600;
    const rngOffline = createRng(3);
    const offline = applyOfflineProgress(
      structuredClone(base) as TestGameState,
      seconds,
      {},
      rngOffline,
    ).state as TestGameState;

    let online = structuredClone(base) as TestGameState;
    const rngOnline = createRng(3);
    for (let i = 0; i < seconds; i += 1) {
      online = processTick(online, 1);
      const rates = getResourceRates(online);
      let totalFoodProdBase = 0;
      (Object.keys(RESOURCES) as Array<keyof typeof RESOURCES>).forEach(
        (id) => {
          if (RESOURCES[id].category === 'FOOD') {
            totalFoodProdBase += rates[id]?.perSec || 0;
          }
        },
      );
      const settlersResult = processSettlersTick(
        online,
        1,
        totalFoodProdBase * 0,
        rngOnline,
        {},
      );
      online = settlersResult.state;
    }

    expect(offline.resources.potatoes.amount).toBeCloseTo(
      online.resources.potatoes.amount,
    );
    expect(offline.population.settlers.length).toBe(
      online.population.settlers.length,
    );
  });
});
