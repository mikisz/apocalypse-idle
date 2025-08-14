import { RESOURCES } from '../data/resources.js';
import { getCapacity } from '../state/capacityCache.ts';

function getAmount(resources: Record<string, any>, res: string): number {
  const entry = resources[res];
  return typeof entry === 'number' ? entry : entry?.amount || 0;
}

export function getOutputCapacityFactor(
  state: any,
  resources: Record<string, any>,
  desiredOutputs: Record<string, number> = {},
  foodCapacity: number,
  totalFoodAmount: number,
): number {
  let factor = 1;
  let totalFoodOut = 0;
  Object.entries(desiredOutputs).forEach(([res, amount]) => {
    if (RESOURCES[res].category === 'FOOD') {
      if (amount > 0) totalFoodOut += amount;
    } else {
      const capacity = getCapacity(state, res);
      if (!Number.isFinite(capacity)) return;
      const current = getAmount(resources, res);
      const room = capacity - current;
      if (room <= 0) {
        factor = 0;
        return;
      }
      if (amount > 0) factor = Math.min(factor, room / amount);
    }
  });
  if (totalFoodOut > 0) {
    const room = foodCapacity - totalFoodAmount;
    if (room <= 0) factor = 0;
    else factor = Math.min(factor, room / totalFoodOut);
  }
  return Math.max(0, Math.min(1, factor));
}
