import { useCallback } from 'react';
import { useGame, type GameState, type BuildingEntry } from '../useGame.tsx';
import {
  getBuildingCostEntries,
  getBuildingOutputs,
  getBuildingInputs,
  canAffordBuilding,
  getCapacity,
} from '../selectors.js';
import { demolishBuilding, buildBuilding } from '../../engine/production.ts';
import { RESEARCH_MAP } from '../../data/research.js';
import type { Building as BuildingDefinition } from '../../data/buildings.js';

export interface UseBuilding {
  count: number;
  atMax: boolean;
  costEntries: [string, number][];
  perOutputs: { res: string; perSec: number }[];
  perInputs: { res: string; perSec: number }[];
  canAfford: boolean;
  unlocked: boolean;
  offlineReason?: string;
  isDesiredOn: boolean;
  resourceShortage: boolean;
  buildTooltip: string | null;
  showPowerWarning: boolean;
  onBuild: () => void;
  onDemolish: () => void;
  onToggle: (on: boolean) => void;
}

export default function useBuilding(
  building: BuildingDefinition,
  completedResearch: string[] = [],
): UseBuilding {
  const { state, setState } = useGame();
  const buildings = state.buildings as Record<string, BuildingEntry>;
  const count = buildings[building.id]?.count || 0;
  const isDesiredOn = buildings[building.id]?.isDesiredOn ?? true;
  const atMax = building.maxCount != null && count >= building.maxCount;
  const costEntries = getBuildingCostEntries(state, building);
  const perOutputs = getBuildingOutputs(state, building);
  const perInputs = getBuildingInputs(state, building);
  const canAfford = canAffordBuilding(state, building);
  const offlineReason = buildings[building.id]?.offlineReason;
  const resources = state.resources as Record<string, { amount?: number }>;
  const resourceShortage =
    isDesiredOn &&
    perInputs.some(
      (i) => i.res !== 'power' && (resources[i.res]?.amount || 0) <= 0,
    );
  const unlocked =
    !building.requiresResearch ||
    completedResearch.includes(building.requiresResearch);
  const buildTooltip = !unlocked
    ? `Requires: ${
        RESEARCH_MAP[building.requiresResearch!]?.name ||
        building.requiresResearch
      }`
    : atMax
      ? `Max ${building.maxCount}`
      : null;
  const showPowerWarning = Boolean(
    building.outputsPerSecBase?.power && getCapacity(state, 'power') <= 0,
  );

  const onBuild = useCallback((): void => {
    if (!canAfford || !unlocked || atMax) return;
    setState((prev: GameState): GameState => buildBuilding(prev, building.id));
  }, [canAfford, unlocked, atMax, setState, building.id]);

  const onDemolish = useCallback((): void => {
    if (count <= 0) return;
    setState(
      (prev: GameState): GameState => demolishBuilding(prev, building.id),
    );
  }, [count, setState, building.id]);

  const onToggle = useCallback(
    (on: boolean): void => {
      setState((prev: GameState): GameState => {
        const prevBuildings = prev.buildings as Record<string, BuildingEntry>;
        const prevEntry = prevBuildings[building.id] || { count: 0 };
        return {
          ...prev,
          buildings: {
            ...prevBuildings,
            [building.id]: { ...prevEntry, isDesiredOn: on },
          },
        } as GameState;
      });
    },
    [setState, building.id],
  );

  return {
    count,
    atMax,
    costEntries,
    perOutputs,
    perInputs,
    canAfford,
    unlocked,
    offlineReason,
    isDesiredOn,
    resourceShortage,
    buildTooltip,
    showPowerWarning,
    onBuild,
    onDemolish,
    onToggle,
  };
}
