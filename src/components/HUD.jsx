import { useGame } from '../state/GameContext.jsx'
import { computeProductionPerSec } from '../engine/mechanics.js'

export default function HUD() {
  const { state } = useGame()
  const rates = computeProductionPerSec(state)
  const items = Object.entries(state.resources)

  return (
    <div className="grid gap-2">
      {items.map(([id, r]) => (
        <div key={id} className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-[#12192a] border border-stroke">
            <span>{id === 'scrap' ? '🧩' : '⬜'}</span>
            <span className="opacity-90">{id === 'scrap' ? 'Złom' : id}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <strong className="text-base tabular-nums">{r.amount.toFixed(1)}</strong>
            <span className="text-xs text-muted">/ {r.capacity}</span>
            <span className="text-xs text-muted">(+{(rates[id] || 0).toFixed(2)}/s)</span>
          </div>
        </div>
      ))}
    </div>
  )
}
