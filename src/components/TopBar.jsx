import { useState } from 'react'
import { getSeasonModifiers, getTimeBreakdown } from '../engine/time.js'
import { useGame } from '../state/useGame.js'

export default function TopBar() {
  const { state, toggleDrawer } = useGame()
  const time = getTimeBreakdown(state)
  const modifiers = getSeasonModifiers(state)
  const [open, setOpen] = useState(false)

  const labels = { farmingSpeed: 'Growth', farmingYield: 'Yield' }

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-stroke bg-bg2">
      <span className="tabular-nums text-xl">Year {time.year}</span>
      <h1 className="font-semibold">Apocalypse Idle</h1>
      <div className="relative flex items-center gap-2">
        <button
          className="text-xl tabular-nums"
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {time.season.icon} {time.season.label}, Day {time.dayInSeason}
        </button>
        {open && (
          <div
            className="absolute top-full right-0 mt-1 p-2 bg-bg2 border border-stroke rounded text-xs shadow-lg"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            {Object.entries(modifiers).map(([key, val]) => (
              <div key={key} className="whitespace-nowrap">
                {(labels[key] || key)} x{val.toFixed(1)}
              </div>
            ))}
          </div>
        )}
        <button
          className="text-xl px-2 py-1 rounded border border-stroke"
          onClick={toggleDrawer}
        >
          ☰
        </button>
      </div>
    </header>
  )
}

