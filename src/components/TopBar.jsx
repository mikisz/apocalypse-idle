import { getSeason } from '../engine/time.js'
import { useGame } from '../state/useGame.js'

export default function TopBar() {
  const { state, toggleDrawer } = useGame()
  const season = getSeason(state.gameTime)

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-stroke bg-bg2">
      <span className="text-xl">{season === 'unknown' ? '❔' : season}</span>
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

