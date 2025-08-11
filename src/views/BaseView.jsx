import { useGame } from '../state/useGame.js';
import EventLog from '../components/EventLog.jsx';
import ResourceSidebar from '../components/ResourceSidebar.jsx';
import Accordion from '../components/Accordion.jsx';
import {
  PRODUCTION_BUILDINGS,
  STORAGE_BUILDINGS,
  getBuildingCost,
} from '../data/buildings.js';
import { RESOURCES } from '../data/resources.js';
import { getSeason, getSeasonMultiplier } from '../engine/time.js';
import { getCapacity } from '../state/selectors.js';
import { formatAmount, formatRate } from '../utils/format.js';
import { demolishBuilding } from '../engine/production.js';

function BuildingRow({ building }) {
  const { state, setState } = useGame();
  const count = state.buildings[building.id]?.count || 0;
  const season = getSeason(state);
  const scaledCost = getBuildingCost(building, count);
  const costEntries = Object.entries(scaledCost);
  const canAfford = costEntries.every(
    ([res, amt]) => (state.resources[res]?.amount || 0) >= amt,
  );
  const perOutputs = Object.entries(building.outputsPerSecBase || {}).map(
    ([res, base]) => {
      const mult = getSeasonMultiplier(season, RESOURCES[res].category);
      return { res, perSec: base * mult };
    },
  );

  const build = () => {
    if (!canAfford) return;
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
        entry.amount = Math.min(cap, entry.amount);
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
        <span>
          {building.name} ({count})
        </span>
        <div className="space-x-2">
          <button
            className="px-2 py-1 border border-stroke rounded disabled:opacity-50"
            onClick={build}
            disabled={!canAfford}
          >
            Build
          </button>
          <button
            className="px-2 py-1 border border-stroke rounded disabled:opacity-50"
            onClick={demolish}
            disabled={count <= 0}
          >
            Demolish
          </button>
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
        {perOutputs.map((o) => (
          <div key={o.res}>
            {RESOURCES[o.res].name} {formatRate(o.perSec)}
          </div>
        ))}
        {building.capacityAdd && (
          <div>
            {Object.entries(building.capacityAdd)
              .map(
                ([res, cap]) =>
                  `+${formatAmount(cap)} ${RESOURCES[res].name} cap`,
              )
              .join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BaseView() {
  const { state } = useGame();
  return (
    <div className="p-4 space-y-6 pb-20 md:flex md:space-y-0 md:space-x-6">
      <div className="md:w-64 md:flex-shrink-0">
        <ResourceSidebar />
      </div>
      <div className="flex-1 space-y-6">
        <div className="border border-stroke rounded">
          <Accordion title="Production" defaultOpen>
            {PRODUCTION_BUILDINGS.map((b) => (
              <BuildingRow key={b.id} building={b} />
            ))}
          </Accordion>
          <Accordion title="Storage">
            {STORAGE_BUILDINGS.map((b) => (
              <BuildingRow key={b.id} building={b} />
            ))}
          </Accordion>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Event Log</h2>
          <EventLog log={state.log} />
        </div>
      </div>
    </div>
  );
}
