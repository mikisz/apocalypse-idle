import React from 'react';
import { useGame } from '../state/useGame.ts';
import { getBuildingCost } from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
import { getSeason, getSeasonMultiplier } from '../engine/time.js';
import { getCapacity } from '../state/selectors.js';
import { formatAmount } from '../utils/format.js';
import { clampResource, demolishBuilding } from '../engine/production.js';
import { RESEARCH_MAP } from '../data/research.js';
import { Button } from './Button';

export default function BuildingRow({ building, completedResearch }) {
  const { state, setState } = useGame();
  const count = state.buildings[building.id]?.count || 0;
  const atMax = building.maxCount != null && count >= building.maxCount;
  const season = getSeason(state);
  const scaledCost = getBuildingCost(building, count);
  const costEntries = Object.entries(scaledCost);
  const offlineReason = state.buildings[building.id]?.offlineReason;
  const unlocked =
    !building.requiresResearch ||
    completedResearch.includes(building.requiresResearch);
  const canAfford = costEntries.every(
    ([res, amt]) => (state.resources[res]?.amount || 0) >= amt,
  );
  const perOutputs = Object.entries(building.outputsPerSecBase || {}).map(
    ([res, base]) => {
      let mult;
      if (building.seasonProfile === 'constant') mult = 1;
      else if (typeof building.seasonProfile === 'object')
        mult = building.seasonProfile[season.id] ?? 1;
      else mult = getSeasonMultiplier(season, RESOURCES[res].category);
      return { res, perSec: base * mult };
    },
  );
  const perInputs = Object.entries(building.inputsPerSecBase || {}).map(
    ([res, base]) => ({ res, perSec: base }),
  );

  const formatPerSec = (perSec, res) => {
    const sign = perSec >= 0 ? '+' : '-';
    return `${sign}${Math.abs(perSec).toFixed(2)} ${RESOURCES[res].name}/s`;
  };

  const build = () => {
    if (!canAfford || !unlocked || atMax) return;
    setState((prev) => {
      const resources = { ...prev.resources };
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
      };
      Object.keys(resources).forEach((res) => {
        const cap = getCapacity({ ...prev, buildings }, res);
        const entry = resources[res];
        entry.amount = clampResource(entry.amount, cap);
        if (entry.amount > 0) entry.discovered = true;
      });
      return { ...prev, resources, buildings };
    });
  };

  const demolish = () => {
    if (count <= 0) return;
    setState((prev) => demolishBuilding(prev, building.id));
  };

  return (
    <div className="p-2 rounded border border-stroke bg-bg2 space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>
            {building.name}{' '}
            {building.maxCount != null
              ? `${count}/${building.maxCount}`
              : `(${count})`}
          </span>
          {offlineReason && (
            <span className="px-1 text-xs text-white bg-red-600 rounded">
              {offlineReason === 'power' ? 'No Power' : 'Offline'}
            </span>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={build}
            disabled={!canAfford || !unlocked || atMax}
            title={
              !unlocked
                ? `Requires: ${
                    RESEARCH_MAP[building.requiresResearch]?.name ||
                    building.requiresResearch
                  }`
                : atMax
                  ? `Max ${building.maxCount}`
                  : undefined
            }
          >
            Build
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={demolish}
            disabled={count <= 0}
          >
            Demolish
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted space-y-1">
        <div>{building.description}</div>
        <div>
          Cost:{' '}
          {costEntries
            .map(([res, amt]) => `${formatAmount(amt)} ${RESOURCES[res].name}`)
            .join(', ')}
        </div>
        {!unlocked && building.requiresResearch && (
          <div className="text-red-400">
            Requires:{' '}
            {RESEARCH_MAP[building.requiresResearch]?.name ||
              building.requiresResearch}
          </div>
        )}
        {perOutputs.map((o) => (
          <div key={`out-${o.res}`}>
            Produces: {formatPerSec(o.perSec, o.res)}
          </div>
        ))}
        {perInputs.map((i) => (
          <div key={`in-${i.res}`}>
            Consumes: {formatPerSec(-i.perSec, i.res)}
          </div>
        ))}
        {building.capacityAdd && (
          <div>
            {Object.entries(building.capacityAdd)
              .map(
                ([res, cap]) =>
                  `+${formatAmount(cap)} ${RESOURCES[res].name} capacity`,
              )
              .join(', ')}
          </div>
        )}
        {building.maxCount != null && <div>Max: {building.maxCount}</div>}
        {building.outputsPerSecBase?.power &&
          getCapacity(state, 'power') <= 0 && (
            <div>No Power storage. Excess is lost.</div>
          )}
      </div>
    </div>
  );
}

