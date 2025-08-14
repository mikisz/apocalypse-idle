// @ts-nocheck
import { BUILDINGS, BUILDING_MAP } from '../data/buildings.js';

const TIER_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };

function getTier(building: any): 'A' | 'B' | 'C' | 'D' {
  if (building.category === 'Food') return 'A';
  if (building.type === 'processing') return 'B';
  if (building.category === 'Raw Materials') return 'C';
  return 'D';
}

export function getPoweredConsumerTypeIds(): string[] {
  return BUILDINGS.filter((b) => b.requiresPower || b.poweredMode).map(
    (b) => b.id,
  );
}

export function ensureValidTypeId(typeId: string): void {
  const b = BUILDING_MAP[typeId];
  if (!b) throw new Error(`Unknown building typeId: ${typeId}`);
  if (!(b.requiresPower || b.poweredMode))
    throw new Error(`Building ${typeId} is not a powered consumer`);
}

export function getTypeOrderIndex(typeId: string, order: string[]): number {
  const idx = order.indexOf(typeId);
  return idx === -1 ? Number.POSITIVE_INFINITY : idx;
}

export function buildInitialPowerTypeOrder(existing: string[] = []): string[] {
  const powered = getPoweredConsumerTypeIds();
  const sorted = [...powered].sort((a, b) => {
    const ta = TIER_ORDER[getTier(BUILDING_MAP[a])];
    const tb = TIER_ORDER[getTier(BUILDING_MAP[b])];
    if (ta !== tb) return ta - tb;
    return BUILDING_MAP[a].name.localeCompare(BUILDING_MAP[b].name);
  });
  const result: string[] = [];
  existing.forEach((id) => {
    if (powered.includes(id) && !result.includes(id)) result.push(id);
  });
  sorted.forEach((id) => {
    if (result.includes(id)) return;
    const tier = getTier(BUILDING_MAP[id]);
    let insert = result.length;
    for (let i = result.length - 1; i >= 0; i--) {
      const otherTier = getTier(BUILDING_MAP[result[i]]);
      if (otherTier === tier) {
        insert = i + 1;
        break;
      }
      if (TIER_ORDER[otherTier] < TIER_ORDER[tier]) {
        insert = i + 1;
        break;
      }
    }
    result.splice(insert, 0, id);
  });
  return result;
}
