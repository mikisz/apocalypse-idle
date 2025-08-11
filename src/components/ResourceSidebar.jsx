import { useGame } from '../state/useGame.js';
import Accordion from './Accordion.jsx';
import { getCapacity, getResourceRates } from '../state/selectors.js';
import { computeRoleBonuses } from '../engine/settlers.js';
import { formatAmount } from '../utils/format.js';
import { RESOURCE_LIST } from '../data/resources.js';

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
  const roleBonuses = computeRoleBonuses(state.population?.settlers || []);
  const rates = getResourceRates(state, true, roleBonuses);
  const groups = {};
  const CATEGORY_LABELS = {
    FOOD: 'Food',
    RAW: 'Raw Materials',
    SOCIETY: 'Society',
    CONSTRUCTION_MATERIALS: 'Construction Materials',
  };
  RESOURCE_LIST.forEach((r) => {
    const amount = state.resources[r.id]?.amount || 0;
    const capacity = getCapacity(state, r.id);
    const rateInfo = rates[r.id];
    const discovered = state.resources[r.id]?.discovered;
    if (rateInfo.perSec !== 0 || amount > 0 || discovered) {
      if (!groups[r.category]) groups[r.category] = [];
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
  const entries = Object.entries(groups).map(([cat, items]) => ({
    title: CATEGORY_LABELS[cat] || cat,
    items,
    defaultOpen: true,
  }));

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
