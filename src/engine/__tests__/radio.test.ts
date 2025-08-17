import { describe, it, expect, vi } from 'vitest';
import type { Candidate } from '../candidates.ts';
import type {
  GameState,
  BuildingEntry,
  ResourceState,
} from '../../state/useGame.tsx';

type TestState = Partial<
  Omit<GameState, 'buildings' | 'resources' | 'population' | 'colony'>
> & {
  buildings: Record<string, BuildingEntry>;
  resources: Record<string, ResourceState>;
  population?: Partial<GameState['population']>;
  colony?: Partial<GameState['colony']>;
};

const fakeCandidate = { id: 'cand1' } satisfies Partial<Candidate>;

vi.mock('../candidates.ts', () => ({
  generateCandidate: vi.fn(() => fakeCandidate as Candidate),
}));

import { updateRadio } from '../radio.ts';
import { applyProduction } from '../production.ts';
import { getResourceRates } from '../../state/selectors.js';
import { generateCandidate } from '../candidates.ts';

const mockGenerateCandidate = vi.mocked(generateCandidate);

const baseState: TestState = {
  buildings: { radio: { count: 1 } },
  resources: { power: { amount: 1 } },
  population: { candidate: null },
  colony: { radioTimer: 10 },
};

describe('updateRadio', () => {
  it('decrements timer without creating a candidate if time remains', () => {
    const state: TestState = { ...baseState, colony: { radioTimer: 10 } };
    const { candidate, radioTimer } = updateRadio(state, 3);
    expect(candidate).toBeNull();
    expect(radioTimer).toBe(7);
  });

  it('creates candidate and resets timer when countdown completes', () => {
    const state: TestState = { ...baseState, colony: { radioTimer: 2 } };
    const { candidate, radioTimer } = updateRadio(state, 5);
    expect(mockGenerateCandidate).toHaveBeenCalledOnce();
    expect(candidate).toEqual(fakeCandidate);
    expect(radioTimer).toBe(0);
  });
});

describe('radio building production', () => {
  it('consumes power without producing resources', () => {
    const state: TestState = {
      buildings: { radio: { count: 1 } },
      resources: { power: { amount: 1 } },
    };
    const next = applyProduction(state as unknown as GameState, 5, {});
    const resources = next.resources as Record<string, ResourceState>;
    expect(resources.power.amount).toBeCloseTo(0.5, 5);
  });

  it('reports power consumption in resource rates', () => {
    const state: TestState = {
      buildings: { radio: { count: 1 } },
      resources: { power: { amount: 1 } },
    };
    const rates = getResourceRates(state as unknown as GameState);
    expect(rates.power.perSec).toBeCloseTo(-0.1, 5);
  });
});

describe('buildings without inputs or outputs', () => {
  it('do not crash resource rate calculations', () => {
    const state: TestState = { buildings: { shelter: { count: 1 } }, resources: {} };
    expect(() => getResourceRates(state as unknown as GameState)).not.toThrow();
  });

  it('do not crash production calculations', () => {
    const state: TestState = { buildings: { shelter: { count: 1 } }, resources: {} };
    expect(() => applyProduction(state as unknown as GameState, 5, {})).not.toThrow();
  });
});
