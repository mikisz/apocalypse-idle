import { useState } from 'react'
import { useGame } from '../state/useGame.js'
import { formatAge } from '../utils/format.js'
import {
  assignmentsSummary,
  computeRoleBonuses,
} from '../engine/settlers.js'

export default function PopulationView() {
  const { state, setSettlerRole } = useGame()
  const [onlyLiving, setOnlyLiving] = useState(true)
  const [unassignedOnly, setUnassignedOnly] = useState(false)
  const settlers = state.population?.settlers ?? []
  const filtered = settlers
    .filter((s) => (!onlyLiving || !s.isDead))
    .filter((s) => (!unassignedOnly || s.role == null))
  const { assigned, living } = assignmentsSummary(settlers)
  const bonuses = computeRoleBonuses(settlers)
  const bonusLabels = {
    farming: 'Food',
    scavenging: 'Raw',
  }

  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex flex-wrap gap-2">
        <div className="border border-stroke rounded p-3 bg-bg2/50 text-center">
          <div className="text-xs text-muted">Settlers</div>
          <div className="text-lg font-semibold">
            {assigned}/{living}
          </div>
        </div>
        {Object.entries(bonusLabels).map(([role, label]) => (
          <div
            key={role}
            className="border border-stroke rounded p-3 bg-bg2/50 text-center"
          >
            <div className="text-xs text-muted">{label} bonus</div>
            <div className="text-lg font-semibold">
              +{(bonuses[role] || 0).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyLiving}
            onChange={(e) => setOnlyLiving(e.target.checked)}
          />
          Only living
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={unassignedOnly}
            onChange={(e) => setUnassignedOnly(e.target.checked)}
          />
          Unassigned only
        </label>
      </div>
      {filtered.length > 0 ? (
        filtered.map((s) => {
          const { years, days } = formatAge(s.ageSeconds)
          return (
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
                <span>Age: {years}y {days}d</span>
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
          )
        })
      ) : (
        <div className="text-center text-muted">No survivors</div>
      )}
    </div>
  )
}

