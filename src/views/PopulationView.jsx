import { useGame } from '../state/useGame.js'

export default function PopulationView() {
  const { state, setSettlerRole } = useGame()

  return (
    <div className="p-4 space-y-4 pb-20">
      {state.population.settlers.map((s) => (
        <div
          key={s.id}
          className="border border-stroke rounded p-3 bg-bg2/50 flex flex-col gap-2"
        >
          <div className="font-semibold">
            {s.firstName} {s.lastName}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span
              className={`px-2 py-0.5 rounded text-xs text-white ${
                s.sex === 'M' ? 'bg-blue-700' : 'bg-pink-700'
              }`}
            >
              {s.sex}
            </span>
            <span>Age {s.age}</span>
            <span className="px-2 py-0.5 rounded bg-green-700 text-white text-xs">
              Farm {s.skills.farming}
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-700 text-white text-xs">
              Scav {s.skills.scavenging}
            </span>
            <span>Morale {s.morale}%</span>
          </div>
          <div className="relative inline-block w-36">
            <select
              value={s.role}
              onChange={(e) => setSettlerRole(s.id, e.target.value)}
              className="appearance-none w-full rounded bg-gray-800 text-white px-3 py-2 pr-8 hover:bg-gray-700 focus:outline-none"
            >
              <option value="idle">idle</option>
              <option value="farming">farming</option>
              <option value="scavenging">scavenging</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <span className="w-2 h-2 border-r-2 border-b-2 border-white rotate-45" />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

