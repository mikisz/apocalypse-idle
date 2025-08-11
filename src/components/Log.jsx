import { useGame } from '../state/useGame.js'

export default function Log() {
  const { state } = useGame()
  return (
    <div className="grid gap-1">
      {state.log.length === 0 && <div className="text-xs text-muted">Brak zdarzeń…</div>}
      {state.log.map((line, i) => (
        <div key={i} className="text-xs text-muted">• {line}</div>
      ))}
    </div>
  )
}
