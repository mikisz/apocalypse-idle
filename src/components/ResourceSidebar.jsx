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

function ResourceRow({ name, amount, capacity, rate }) {
  return (
    <div className="flex items-center justify-between text-sm tabular-nums">
      <span>{name}</span>
      <span className="flex flex-col items-end">
        <span>
          {formatAmount(amount)} / {formatAmount(capacity)}
        </span>
        <span className="text-xs text-muted">{rate}</span>
      </span>
    </div>
  )
}

export default function ResourceSidebar() {
  const { state } = useGame()
  const summary = getResourceProductionSummary(state)
  const groups = [
    {
      title: 'Food',
      defaultOpen: true,
      resources: [
        {
          id: 'food',
          name: 'Food',
          amount: state.resources.food?.amount || 0,
          capacity: getCapacity(state, 'food'),
          rate: summary.food?.label,
        },
      ],
    },
    {
      title: 'Resources',
      resources: [
        {
          id: 'wood',
          name: 'Wood',
          amount: state.resources.wood?.amount || 0,
          capacity: getCapacity(state, 'wood'),
          rate: summary.wood?.label,
        },
      ],
    },
  ]

  return (
    <div className="border border-stroke rounded overflow-hidden bg-bg2">
      {groups.map((g) => (
        <Accordion key={g.title} title={g.title} defaultOpen={g.defaultOpen}>
          {g.resources.map((r) => (
            <ResourceRow key={r.id} {...r} />
          ))}
        </Accordion>
      ))}
    </div>
  )
}
