import { getSeasonModifiers } from '../engine/time.js'
import { useGame } from '../state/useGame.js'

export default function TopBar() {
  const { state, toggleDrawer, selectSeason, selectSeasonDay } = useGame()
  const season = selectSeason()
  const day = selectSeasonDay()
  const modifiers = getSeasonModifiers(state)

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-stroke bg-bg2">
      <div className="flex flex-col items-start leading-tight">
        <span className="text-xl">
          {season.icon} {season.label}: Day {day}
        </span>
        <span className="text-xs opacity-80">
          Growth x{modifiers.farmingSpeed.toFixed(1)} • Yield x
          {modifiers.farmingYield.toFixed(1)}
        </span>
      </div>
      <h1 className="font-semibold">Apocalypse Idle</h1>
      <button
        className="text-xl px-2 py-1 rounded border border-stroke"
        onClick={toggleDrawer}
      >
        ☰
      </button>
    </header>
  )
}

