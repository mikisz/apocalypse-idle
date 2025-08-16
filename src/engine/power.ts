import {
  BUILDINGS,
  BUILDING_MAP,
  type Building as BuildingDefinition,
} from '../data/buildings.js';
import type { GameState } from '../state/useGame.tsx';

export type PowerTier = 'A' | 'B' | 'C' | 'D';

const TIER_ORDER: Record<PowerTier, number> = { A: 0, B: 1, C: 2, D: 3 };

function getTier(building: BuildingDefinition): PowerTier {
  if (building.category === 'Food') return 'A';
  if (building.type === 'processing') return 'B';
  if (building.category === 'Raw Materials') return 'C';
  return 'D';
}

type PoweredBuilding = BuildingDefinition & { poweredMode?: boolean };

export function getPoweredConsumerTypeIds(
  buildings: PoweredBuilding[] = BUILDINGS as PoweredBuilding[],
): string[] {
  return buildings
    .filter((b) => b.requiresPower || b.poweredMode)
    .map((b) => b.id);
}

export function ensureValidTypeId(
  typeId: string,
  buildingMap: Record<string, PoweredBuilding> = BUILDING_MAP as Record<
    string,
    PoweredBuilding
  >,
): void {
  const b = buildingMap[typeId];
  if (!b) throw new Error(`Unknown building typeId: ${typeId}`);
  if (!(b.requiresPower || b.poweredMode))
    throw new Error(`Building ${typeId} is not a powered consumer`);
}

export function getTypeOrderIndex(typeId: string, order: string[]): number {
  const idx = order.indexOf(typeId);
  return idx === -1 ? Number.POSITIVE_INFINITY : idx;
}

export function buildInitialPowerTypeOrder(
  existing: string[] = [],
  buildings: PoweredBuilding[] = BUILDINGS as PoweredBuilding[],
  buildingMap: Record<string, PoweredBuilding> = BUILDING_MAP as Record<
    string,
    PoweredBuilding
  >,
): string[] {
  const powered = getPoweredConsumerTypeIds(buildings);
  const sorted = [...powered].sort((a, b) => {
    const ta = TIER_ORDER[getTier(buildingMap[a])];
    const tb = TIER_ORDER[getTier(buildingMap[b])];
    if (ta !== tb) return ta - tb;
    return buildingMap[a].name.localeCompare(buildingMap[b].name);
  });
  const result: string[] = [];
  existing.forEach((id) => {
    if (powered.includes(id) && !result.includes(id)) result.push(id);
  });
  sorted.forEach((id) => {
    if (result.includes(id)) return;
    const tier = getTier(buildingMap[id]);
    let insert = result.length;
    for (let i = result.length - 1; i >= 0; i--) {
      const otherTier = getTier(buildingMap[result[i]]);
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

export function allocatePower(
  state: GameState,
  _buildings: BuildingDefinition[] = BUILDINGS,
): GameState {
  // Power allocation is currently handled within the production tick. This
  // placeholder is provided to keep the API typed.
  return state;
}
