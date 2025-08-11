import { useState } from 'react'
import { useGame } from '../state/useGame.js'
import EventLog from '../components/EventLog.jsx'
import ResourceSidebar from '../components/ResourceSidebar.jsx'
import { FOOD_BUILDINGS } from '../data/farms.js'
import { getSeasonModifiers } from '../engine/time.js'

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

export default function BaseView() {
  const { state, setState } = useGame()

  const addFarm = (building) => {
    setState((prev) => {
      const count = (prev.buildings[building.id]?.count || 0) + 1
      const buildings = {
        ...prev.buildings,
        [building.id]: { ...(prev.buildings[building.id] || {}), count },
      }
      const mods = getSeasonModifiers(prev)
      const growth = building.growthTime * mods.farmingSpeed
      const timers = {
        ...prev.timers,
        food: {
          ...(prev.timers.food || {}),
          [building.id]: prev.timers.food?.[building.id] ?? growth,
        },
      }
      return { ...prev, buildings, timers }
    })
  }

  return (
    <div className="p-4 space-y-6 pb-20 md:flex md:space-y-0 md:space-x-6">
      <div className="md:w-64 md:flex-shrink-0">
        <ResourceSidebar />
      </div>
      <div className="flex-1 space-y-6">
        <div className="border border-stroke rounded">
          <AccordionItem title="Food" defaultOpen>
            {FOOD_BUILDINGS.map((b) => (
              <button
                key={b.id}
                className="w-full text-left p-2 rounded border border-stroke bg-bg2"
                onClick={() => addFarm(b)}
              >
                {b.name} ({state.buildings[b.id]?.count || 0})
              </button>
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
