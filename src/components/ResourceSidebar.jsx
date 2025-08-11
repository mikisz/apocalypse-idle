import { useState } from 'react';
import { useGame } from '../state/useGame.js';
import { getCapacity, getResourceRates } from '../state/selectors.js';
import { formatAmount } from '../utils/format.js';
import { RESOURCE_LIST } from '../data/resources.js';

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stroke">
      <button
        className="w-full flex items-center justify-between p-2"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span>{open ? '-' : '+'}</span>
      </button>
      {open && <div className="p-2 space-y-2">{children}</div>}
    </div>
  );
}

function ResourceRow({ icon, name, amount, capacity, rate }) {
  return (
    <div className="flex items-center justify-between text-sm tabular-nums">
      <span className="flex items-center gap-1">
        <span>{icon}</span>
        <span>{name}</span>
      </span>
      <span className="flex flex-col items-end">
        <span>
          {formatAmount(amount)} / {formatAmount(capacity)}
        </span>
        <span className="text-xs text-muted">{rate}</span>
      </span>
    </div>
  );
}

export default function ResourceSidebar() {
  const { state } = useGame();
  const rates = getResourceRates(state, true);
  const groups = { FOOD: [], RAW: [] };
  RESOURCE_LIST.forEach((r) => {
    const amount = state.resources[r.id]?.amount || 0;
    const capacity = getCapacity(state, r.id);
    const rateInfo = rates[r.id];
    const discovered = state.resources[r.id]?.discovered;
    if (rateInfo.perSec !== 0 || amount > 0 || discovered) {
      groups[r.category].push({
        id: r.id,
        name: r.name,
        icon: r.icon,
        amount,
        capacity,
        rate: rateInfo.label,
      });
    }
  });
  const entries = [];
  if (groups.FOOD.length > 0) {
    entries.push({ title: 'Food', items: groups.FOOD, defaultOpen: true });
  }
  if (groups.RAW.length > 0) {
    entries.push({ title: 'Raw Materials', items: groups.RAW, defaultOpen: true });
  }

  return (
    <div className="border border-stroke rounded overflow-hidden bg-bg2">
      {entries.map((g) => (
        <Accordion key={g.title} title={g.title} defaultOpen={g.defaultOpen}>
          {g.items.map((r) => (
            <ResourceRow key={r.id} {...r} />
          ))}
        </Accordion>
      ))}
    </div>
  );
}
