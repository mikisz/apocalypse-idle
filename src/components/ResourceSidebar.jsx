import { useState } from 'react'
import { useGame } from '../state/useGame.js'
import { getCapacity, getResourceRates, getFoodStats } from '../state/selectors.js'
import { formatAmount } from '../utils/format.js'
import { RESOURCE_LIST } from '../data/resources.js'

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
  const rates = getResourceRates(state)
  const groups = {}
  RESOURCE_LIST.forEach((r) => {
    if (r.category === 'food') return // aggregated separately
    const cat = r.category
    if (!groups[cat]) groups[cat] = []
    groups[cat].push({
      id: r.id,
      name: r.name,
      amount: state.resources[r.id]?.amount || 0,
      capacity: getCapacity(state, r.id),
      rate: rates[r.id]?.label,
    })
  })
  const entries = Object.entries(groups).map(([cat, items]) => ({
    title: cat.charAt(0).toUpperCase() + cat.slice(1),
    items,
    defaultOpen: cat === 'resources',
  }))
  const foodStats = getFoodStats(state)

  return (
    <div className="border border-stroke rounded overflow-hidden bg-bg2">
      <div className="p-2 border-b border-stroke">
        <ResourceRow
          name="Food"
          amount={foodStats.amount}
          capacity={foodStats.capacity}
          rate={foodStats.rate}
        />
      </div>
      {entries.map((g) => (
        <Accordion key={g.title} title={g.title} defaultOpen={g.defaultOpen}>
          {g.items.map((r) => (
            <ResourceRow key={r.id} {...r} />
          ))}
        </Accordion>
      ))}
    </div>
  )
}
