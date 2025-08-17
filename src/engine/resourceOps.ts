import { RESOURCES } from '../data/resources.js';
const RESOURCES_MAP = RESOURCES as Record<string, { category?: string }>;
import { clampResource } from './resources.ts';
import { getCapacity } from '../state/capacityCache.ts';

// Adds amount of resource, clamping to capacity and updating metadata.
// For FOOD resources, updates the provided foodPool object { amount, capacity }.
// Returns the actual amount added after clamping.
export function addResource(
  state: any,
  resources: Record<string, any>,
  id: string,
  amount: number,
  foodPool?: { amount: number; capacity: number },
): number {
  const entry = resources[id] || { amount: 0, discovered: false, produced: 0 };
  const category = RESOURCES_MAP[id]?.category;
  if (category === 'FOOD') {
    const cap = foodPool?.capacity ?? 0;
    const room = cap - (foodPool?.amount ?? 0);
    const gain = Math.max(0, Math.min(amount, room));
    const next = entry.amount + gain;
    resources[id] = {
      amount: next,
      discovered: entry.discovered || next > 0,
      produced: (entry.produced || 0) + Math.max(0, gain),
    };
    if (foodPool) foodPool.amount += gain;
    return gain;
  } else {
    const capacity = getCapacity(state, id);
    const next = clampResource(entry.amount + amount, capacity);
    const actual = next - entry.amount;
    resources[id] = {
      amount: next,
      discovered: entry.discovered || next > 0,
      produced: (entry.produced || 0) + Math.max(0, actual),
    };
    return actual;
  }
}

// Consumes amount of resource (not going below 0). For FOOD resources,
// updates the provided foodPool. Returns the actual amount consumed.
export function consumeResource(
  state: any,
  resources: Record<string, any>,
  id: string,
  amount: number,
  foodPool?: { amount: number; capacity: number },
): number {
  const entry = resources[id] || { amount: 0, discovered: false, produced: 0 };
  const category = RESOURCES_MAP[id]?.category;
  const consume = Math.min(entry.amount, amount);
  const remaining = Math.max(0, entry.amount - consume);
  if (category === 'FOOD') {
    resources[id] = {
      ...entry,
      amount: remaining,
      discovered: entry.discovered || remaining > 0,
    };
    if (foodPool)
      foodPool.amount = Math.max(0, (foodPool.amount ?? 0) - consume);
  } else {
    resources[id] = {
      ...entry,
      amount: remaining,
      discovered: entry.discovered || remaining > 0,
    };
  }
  return consume;
}

export default { addResource, consumeResource };
