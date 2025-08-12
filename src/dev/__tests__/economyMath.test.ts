import { describe, it, expect } from 'vitest';
import {
  valueWeightedStream,
  nextCost,
  seasonMultiplier,
  pbtAtN,
} from '../economyMath.ts';
import type { BuildingData, SeasonsRecord } from '../economyTypes.ts';

describe('economyMath helpers', () => {
  it('valueWeightedStream', () => {
    const weights = { wood: 1, stone: 2 };
    const out = { wood: 2 };
    const input = { stone: 1 };
    expect(valueWeightedStream(out, input, weights)).toBeCloseTo(0);
  });

  it('nextCost growth', () => {
    expect(nextCost(10, 1.15, 2)).toBe(Math.ceil(10 * 1.15 ** 2));
  });

  it('seasonMultiplier averages', () => {
    const seasons: SeasonsRecord = {
      spring: { multipliers: { FOOD: 1.2 } },
      summer: { multipliers: { FOOD: 1.0 } },
    };
    const building: BuildingData = { id: 'b', costGrowth: 1, category: 'FOOD' };
    expect(seasonMultiplier(building, 'average', seasons)).toBeCloseTo((1.2 + 1.0) / 2);
  });

  it('pbtAtN basic', () => {
    const seasons: SeasonsRecord = {
      spring: { multipliers: { RAW: 1 } },
      summer: { multipliers: { RAW: 1 } },
    };
    const building: BuildingData = {
      id: 'log',
      costBase: { wood: 10 },
      costGrowth: 1.1,
      outputsPerSecBase: { wood: 1 },
      category: 'RAW',
    };
    const weights = { wood: 1 };
    const pbt = pbtAtN(building, 0, 'average', weights, seasons);
    const cost = nextCost(10, 1.1, 0);
    expect(pbt).toBeCloseTo(cost / 1);
  });
});
