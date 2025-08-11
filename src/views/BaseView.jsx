import { useState } from 'react'
import { useGame } from '../state/useGame.js'
import EventLog from '../components/EventLog.jsx'
import ResourceSidebar from '../components/ResourceSidebar.jsx'
import { FOOD_BUILDINGS, RESOURCE_BUILDINGS } from '../data/buildings.js'
import { getSeasonModifiers } from '../engine/time.js'
import { getCapacity } from '../state/selectors.js'
import { formatRate } from '../utils/format.js'

function AccordionItem({ title, children, defaultOpen = false }) {
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

function BuildingRow({ building }) {
  const { state, setState } = useGame()
  const count = state.buildings[building.id]?.count || 0
  const mods = getSeasonModifiers(state)
  const effectiveGrowth = building.growthTime * mods.farmingSpeed
  const effectiveHarvest =
    building.harvestAmount * mods.farmingYield * building.yieldValue
  const costEntries = Object.entries(building.cost || {})
  const canAfford = costEntries.every(
    ([res, amt]) => (state.resources[res]?.amount || 0) >= amt,
  )

  const build = () => {
    if (!canAfford) return
    setState((prev) => {
      const resources = { ...prev.resources }
      costEntries.forEach(([res, amt]) => {
        const current = prev.resources[res]?.amount || 0
        resources[res] = { ...prev.resources[res], amount: current - amt }
      })
      const newCount = (prev.buildings[building.id]?.count || 0) + 1
      const buildings = {
        ...prev.buildings,
        [building.id]: { ...(prev.buildings[building.id] || {}), count: newCount },
      }
      let timers = { ...prev.timers }
      if (building.growthTime) {
        const group = { ...(prev.timers?.[building.resource] || {}) }
        group[building.id] = group[building.id] ?? effectiveGrowth
        timers = { ...prev.timers, [building.resource]: group }
      }
      return { ...prev, resources, buildings, timers }
    })
  }

  const demolish = () => {
    if (count <= 0) return
    setState((prev) => {
      const refundRatio = building.demolishRefundRatio ?? 0.5
      const resources = { ...prev.resources }
      costEntries.forEach(([res, amt]) => {
        const refund = Math.floor(amt * refundRatio)
        const capacity = getCapacity(prev, res)
        const current = prev.resources[res]?.amount || 0
        const next = Math.min(capacity, current + refund)
        resources[res] = { ...prev.resources[res], amount: next }
      })
      const newCount = (prev.buildings[building.id]?.count || 0) - 1
      const buildings = {
        ...prev.buildings,
        [building.id]: { ...(prev.buildings[building.id] || {}), count: newCount },
      }
      let timers = { ...prev.timers }
      if (building.growthTime) {
        const group = { ...(prev.timers?.[building.resource] || {}) }
        if (newCount <= 0) delete group[building.id]
        timers = { ...prev.timers, [building.resource]: group }
      }
      return { ...prev, resources, buildings, timers }
    })
  }

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
      <div className="text-xs text-muted">
        <div>
          Cost: {costEntries.map(([res, amt]) => `${amt} ${res}`).join(', ')}
        </div>
        <div>
          {formatRate({ amountPerHarvest: effectiveHarvest, intervalSec: effectiveGrowth })}
        </div>
      </div>
    </div>
  )
}

export default function BaseView() {
  const { state } = useGame()
  return (
    <div className="p-4 space-y-6 pb-20 md:flex md:space-y-0 md:space-x-6">
      <div className="md:w-64 md:flex-shrink-0">
        <ResourceSidebar />
      </div>
      <div className="flex-1 space-y-6">
        <div className="border border-stroke rounded">
          <AccordionItem title="Food" defaultOpen>
            {FOOD_BUILDINGS.map((b) => (
              <BuildingRow key={b.id} building={b} />
            ))}
          </AccordionItem>
          <AccordionItem title="Resources">
            {RESOURCE_BUILDINGS.map((b) => (
              <BuildingRow key={b.id} building={b} />
            ))}
          </AccordionItem>
          <AccordionItem title="Storage">
            <p className="text-sm text-muted">Coming soon</p>
          </AccordionItem>
          <AccordionItem title="Industry">
            <p className="text-sm text-muted">Coming soon</p>
          </AccordionItem>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Event Log</h2>
          <EventLog log={state.log} />
        </div>
      </div>
    </div>
  )
}
