// @ts-nocheck
import { describe, it, expect } from 'vitest';
import {
  valueWeightedStream,
  nextCost,
  seasonMultiplier,
  pbtAtN,
} from '../economyMath.ts';
import type { BuildingData, SeasonsRecord } from '../economyTypes.ts';
import { BUILDINGS } from '../../data/buildings.js';
import { RESOURCES } from '../../data/resources.js';
import { SEASONS } from '../../engine/time.ts';

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

  it('seasonMultiplier derives category from building resources', () => {
    const seasons: SeasonsRecord = Object.fromEntries(
      SEASONS.map((s) => [s.id, { multipliers: s.multipliers }]),
    );
    const potatoField = BUILDINGS.find((b) => b.id === 'potatoField');
    expect(potatoField).toBeDefined();
    const category = RESOURCES.potatoes.category;
    const springMult = seasonMultiplier(potatoField!, 'spring', seasons);
    const winterMult = seasonMultiplier(potatoField!, 'winter', seasons);
    expect(springMult).toBeCloseTo(
      SEASONS.find((s) => s.id === 'spring')!.multipliers[category],
    );
    expect(winterMult).toBeCloseTo(
      SEASONS.find((s) => s.id === 'winter')!.multipliers[category],
    );
  });

  it('seasonMultiplier respects explicit seasonProfile', () => {
    const seasons: SeasonsRecord = Object.fromEntries(
      SEASONS.map((s) => [s.id, { multipliers: s.multipliers }]),
    );
    const huntersHut = BUILDINGS.find((b) => b.id === 'huntersHut');
    expect(huntersHut).toBeDefined();
    expect(seasonMultiplier(huntersHut!, 'winter', seasons)).toBeCloseTo(0.6); // changed: 0.8→0.6
  });

  it('seasonMultiplier constant profile returns 1', () => {
    const seasons: SeasonsRecord = Object.fromEntries(
      SEASONS.map((s) => [s.id, { multipliers: s.multipliers }]),
    );
    const sawmill = BUILDINGS.find((b) => b.id === 'sawmill');
    expect(sawmill).toBeDefined();
    expect(seasonMultiplier(sawmill!, 'spring', seasons)).toBe(1);
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
    };
    const weights = { wood: 1 };
    const pbt = pbtAtN(building, 0, 'average', weights, seasons);
    const cost = nextCost(10, 1.1, 0);
    expect(pbt).toBeCloseTo(cost / 1);
  });
});
