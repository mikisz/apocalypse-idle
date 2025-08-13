import { useCallback } from 'react';
import { useGame } from '../useGame.tsx';
import {
  getBuildingCostEntries,
  getBuildingOutputs,
  getBuildingInputs,
  canAffordBuilding,
  getCapacity,
} from '../selectors.js';
import { clampResource } from '../../engine/resources.js';
import { demolishBuilding } from '../../engine/production.js';
import { RESEARCH_MAP } from '../../data/research.js';

export default function useBuilding(building: any, completedResearch: string[] = []) {
  const { state, setState } = useGame();
  const count = state.buildings[building.id]?.count || 0;
  const atMax = building.maxCount != null && count >= building.maxCount;
  const costEntries = getBuildingCostEntries(state, building);
  const perOutputs = getBuildingOutputs(state, building);
  const perInputs = getBuildingInputs(state, building);
  const canAfford = canAffordBuilding(state, building);
  const offlineReason = state.buildings[building.id]?.offlineReason;
  const unlocked =
    !building.requiresResearch || completedResearch.includes(building.requiresResearch);
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
    setState((prev) => {
      const resources = { ...prev.resources } as any;
      costEntries.forEach(([res, amt]) => {
        const currentEntry = resources[res] || { amount: 0, discovered: false };
        const next = currentEntry.amount - amt;
        resources[res] = {
          amount: next,
          discovered: currentEntry.discovered || next > 0,
        };
      });
      const newCount = count + 1;
      const buildings = {
        ...prev.buildings,
        [building.id]: { count: newCount },
      } as any;
      Object.keys(resources).forEach((res) => {
        const cap = getCapacity({ ...prev, buildings } as any, res);
        const entry = resources[res];
        entry.amount = clampResource(entry.amount, cap);
        if (entry.amount > 0) entry.discovered = true;
      });
      return { ...prev, resources, buildings } as any;
    });
  }, [canAfford, unlocked, atMax, costEntries, setState, count, building.id]);

  const onDemolish = useCallback(() => {
    if (count <= 0) return;
    setState((prev) => demolishBuilding(prev, building.id));
  }, [count, setState, building.id]);

  return {
    count,
    atMax,
    costEntries,
    perOutputs,
    perInputs,
    canAfford,
    unlocked,
    offlineReason,
    buildTooltip,
    showPowerWarning,
    onBuild,
    onDemolish,
  };
}
