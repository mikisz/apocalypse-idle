import { useCallback } from 'react';
import { useGame } from '../useGame.tsx';
import {
  getBuildingCostEntries,
  getBuildingOutputs,
  getBuildingInputs,
  canAffordBuilding,
  getCapacity,
} from '../selectors.js';
import { demolishBuilding, buildBuilding } from '../../engine/production.ts';
import { RESEARCH_MAP } from '../../data/research.js';
import type { Building } from '../../data/buildings.js';

interface BuildingState {
  count: number;
  isDesiredOn?: boolean;
  offlineReason?: string;
}

export default function useBuilding(
  building: Building,
  completedResearch: string[] = [],
) {
  const { state, setState } = useGame();
  const count = state.buildings[building.id]?.count || 0;
  const isDesiredOn = state.buildings[building.id]?.isDesiredOn ?? true;
  const atMax = building.maxCount != null && count >= building.maxCount;
  const costEntries = getBuildingCostEntries(state, building);
  const perOutputs = getBuildingOutputs(state, building);
  const perInputs = getBuildingInputs(state, building);
  const canAfford = canAffordBuilding(state, building);
  const offlineReason = state.buildings[building.id]?.offlineReason;
  const resourceShortage =
    isDesiredOn &&
    perInputs.some(
      (i) => i.res !== 'power' && (state.resources[i.res]?.amount || 0) <= 0,
    );
  const unlocked =
    !building.requiresResearch ||
    completedResearch.includes(building.requiresResearch);
  const buildTooltip = !unlocked
    ? `Requires: ${RESEARCH_MAP[building.requiresResearch]?.name || building.requiresResearch}`
    : atMax
      ? `Max ${building.maxCount}`
      : null;
  const showPowerWarning = Boolean(
    building.outputsPerSecBase?.power && getCapacity(state, 'power') <= 0,
  );

  const onBuild = useCallback(() => {
    if (!canAfford || !unlocked || atMax) return;
    setState((prev) => buildBuilding(prev, building.id));
  }, [canAfford, unlocked, atMax, setState, building.id]);

  const onDemolish = useCallback(() => {
    if (count <= 0) return;
    setState((prev) => demolishBuilding(prev, building.id));
  }, [count, setState, building.id]);

  const onToggle = useCallback(
    (on: boolean) => {
      setState((prev) => {
        const prevBuildings = prev.buildings as Record<string, BuildingState>;
        const prevEntry = prevBuildings[building.id] || { count: 0 };
        return {
          ...prev,
          buildings: {
            ...prevBuildings,
            [building.id]: { ...prevEntry, isDesiredOn: on },
          },
        };
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
