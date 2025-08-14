// @ts-nocheck
import type { BuildingData, ResourceMap, SeasonsRecord } from './economyTypes.ts';
import { RESOURCES } from '../data/resources.js';

export function valueWeightedStream(
  outputs: ResourceMap = {},
  inputs: ResourceMap = {},
  weights: ResourceMap,
): number {
  let total = 0;
  for (const [res, amt] of Object.entries(outputs)) {
    total += amt * (weights[res] ?? 0);
  }
  for (const [res, amt] of Object.entries(inputs)) {
    total -= amt * (weights[res] ?? 0);
  }
  return total;
}

export function nextCost(base: number, growth: number, nOwned: number): number {
  return Math.ceil(base * Math.pow(growth, nOwned));
}

export function marginalWeightedCost(
  building: BuildingData,
  nOwned: number,
  weights: ResourceMap,
): number {
  const baseCosts = building.costBase || {};
  let total = 0;
  for (const [res, base] of Object.entries(baseCosts)) {
    const cost = nextCost(base, building.costGrowth, nOwned);
    total += cost * (weights[res] ?? 0);
  }
  return total;
}

export function seasonMultiplier(
  building: BuildingData,
  mode: 'average' | 'winter' | 'spring' | 'summer' | 'autumn',
  seasons: SeasonsRecord,
): number {
  const seasonIds = Object.keys(seasons);

  function resolveCategory(): string | undefined {
    for (const res of Object.keys(building.outputsPerSecBase || {})) {
      const cat = RESOURCES[res]?.category;
      if (cat) return cat;
    }
    for (const res of Object.keys(building.inputsPerSecBase || {})) {
      const cat = RESOURCES[res]?.category;
      if (cat) return cat;
    }
    return undefined;
  }

  function multForSeason(seasonId: string): number {
    if (building.seasonProfile === 'constant') return 1;
    if (typeof building.seasonProfile === 'object') {
      return building.seasonProfile[seasonId] ?? 1;
    }
    const cat = resolveCategory();
    return cat ? seasons[seasonId]?.multipliers?.[cat] ?? 1 : 1;
  }

  if (mode === 'average') {
    const vals = seasonIds.map((id) => multForSeason(id));
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  return multForSeason(mode);
}

export function marginalWeightedDeltaProdPerSec(
  building: BuildingData,
  mode: 'average' | 'winter' | 'spring' | 'summer' | 'autumn',
  weights: ResourceMap,
  seasons: SeasonsRecord,
): number {
  const base = valueWeightedStream(
    building.outputsPerSecBase || {},
    building.inputsPerSecBase || {},
    weights,
  );
  const mult = seasonMultiplier(building, mode, seasons);
  return base * mult;
}

export function pbtAtN(
  building: BuildingData,
  nOwned: number,
  mode: 'average' | 'winter' | 'spring' | 'summer' | 'autumn',
  weights: ResourceMap,
  seasons: SeasonsRecord,
): number {
  const cost = marginalWeightedCost(building, nOwned, weights);
  const delta = marginalWeightedDeltaProdPerSec(building, mode, weights, seasons);
  if (delta <= 0) return Infinity;
  return cost / delta;
}

// optional recommendAdjustments placeholder
export function recommendAdjustments() {
  return {} as Record<string, never>;
}
