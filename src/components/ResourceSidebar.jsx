import { useState } from 'react'
import { useGame } from '../state/useGame.js'
import { getCapacity, getResourceProductionSummary } from '../state/selectors.js'
import { formatAmount } from '../utils/format.js'

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
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
  )
}

function ResourceRow({ name, amount, capacity, rate, indent = false }) {
  return (
    <div
      className={`flex items-center justify-between text-sm tabular-nums ${
        indent ? 'pl-4' : ''
      }`}
    >
      <span>{name}</span>
      <span className="flex flex-col items-end">
        <span>
          {formatAmount(amount)}
          {capacity != null && ` / ${formatAmount(capacity)}`}
        </span>
        <span className="text-xs text-muted">{rate}</span>
      </span>
    </div>
  )
}

export default function ResourceSidebar() {
  const { state } = useGame()
  const summary = getResourceProductionSummary(state)
  const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  const groups = [
    {
      title: 'Food',
      defaultOpen: true,
      total: {
        id: 'food-total',
        name: 'Food',
        amount: state.resources.food?.amount || 0,
        capacity: getCapacity(state, 'food'),
        rate: summary.categories.food?.label,
      },
      items: Object.entries(state.resources.food?.stocks || {})
        .filter(([k]) => k !== 'misc')
        .map(([type, amount]) => ({
          id: type,
          name: titleCase(type),
          amount,
          rate: summary.types[type]?.label,
        })),
    },
    {
      title: 'Resources',
      total: {
        id: 'resources-total',
        name: 'Resources',
        amount: state.resources.wood?.amount || 0,
        capacity: getCapacity(state, 'wood'),
        rate: summary.categories.wood?.label,
      },
      items: Object.entries(state.resources.wood?.stocks || {})
        .filter(([k]) => k !== 'misc')
        .map(([type, amount]) => ({
          id: type,
          name: titleCase(type),
          amount,
          rate: summary.types[type]?.label,
        })),
    },
  ]

  return (
    <div className="border border-stroke rounded overflow-hidden bg-bg2">
      {groups.map((g) => (
        <Accordion key={g.title} title={g.title} defaultOpen={g.defaultOpen}>
          <ResourceRow {...g.total} />
          {g.items.map((r) => (
            <ResourceRow key={r.id} {...r} indent />
          ))}
        </Accordion>
      ))}
    </div>
  )
}
