import { useGame } from '../state/useGame.js'

export default function PopulationView() {
  const { state, setSettlerRole } = useGame()

  return (
    <div className="p-4 space-y-4 pb-20">
      {state.population.map((s) => (
        <div
          key={s.id}
          className="border border-stroke rounded p-2 space-y-1"
        >
          <div className="font-semibold">
            {s.firstName} {s.lastName}
          </div>
          <div className="text-sm text-muted">
            {s.gender}, {s.age}
          </div>
          <select
            value={s.role}
            onChange={(e) => setSettlerRole(s.id, e.target.value)}
            className="mt-1 p-1 rounded bg-bg2 border border-stroke"
          >
            <option value="idle">idle</option>
            <option value="food">food</option>
            <option value="scrap">scrap</option>
          </select>
        </div>
      ))}
    </div>
  )
}

