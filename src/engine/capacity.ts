import { RESOURCES } from '../data/resources.js';
const RESOURCES_MAP = RESOURCES as Record<string, { category: string }>;
import { getCapacity } from '../state/capacityCache.ts';

function getAmount(resources: Record<string, any>, res: string): number {
  const entry = resources[res];
  return typeof entry === 'number' ? entry : entry?.amount || 0;
}

export function getOutputCapacityFactors(
  state: any,
  resources: Record<string, any>,
  desiredOutputs: Record<string, number> = {},
  foodCapacity: number,
  totalFoodAmount: number,
): Record<string, number> {
  const factors: Record<string, number> = {};
  let foodRoom = foodCapacity - totalFoodAmount;
  Object.entries(desiredOutputs).forEach(([res, amount]) => {
    if (RESOURCES_MAP[res].category === 'FOOD') {
      const room = Math.max(0, foodRoom);
      const factor = amount > 0 ? Math.min(1, room / amount) : 1;
      factors[res] = Math.max(0, factor);
      foodRoom -= amount * factors[res];
    } else {
      const capacity = getCapacity(state, res);
      if (!Number.isFinite(capacity)) {
        factors[res] = 1;
        return;
      }
      const current = getAmount(resources, res);
      const room = capacity - current;
      if (room <= 0) {
        factors[res] = 0;
        return;
      }
      const factor = amount > 0 ? Math.min(1, room / amount) : 1;
      factors[res] = Math.max(0, factor);
    }
  });
  return factors;
}
