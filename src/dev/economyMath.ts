import type { BuildingData, ResourceMap, SeasonsRecord } from './economyTypes.ts';

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
  buildingOrCategory: BuildingData | string,
  mode: 'average' | 'winter' | 'spring' | 'summer' | 'autumn',
  seasons: SeasonsRecord,
): number {
  const seasonIds = Object.keys(seasons);

  function multForSeason(seasonId: string): number {
    if (typeof buildingOrCategory === 'string') {
      return seasons[seasonId]?.multipliers?.[buildingOrCategory] ?? 1;
    }
    const b = buildingOrCategory as BuildingData;
    if (b.seasonProfile === 'constant') return 1;
    if (typeof b.seasonProfile === 'object') {
      return b.seasonProfile[seasonId] ?? 1;
    }
    const cat = b.category;
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
