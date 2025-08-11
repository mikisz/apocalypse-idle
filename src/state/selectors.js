import { BUILDINGS } from '../data/buildings.js'
import { getSeasonModifiers } from '../engine/time.js'
import { formatRate } from '../utils/format.js'

export function getCapacity(state, resourceId) {
  const storage = state.storage?.[resourceId] || { base: 0, fromBuildings: 0 }
  return (storage.base || 0) + (storage.fromBuildings || 0)
}

export function getResourceProductionSummary(state) {
  const summaries = {}
  const mods = getSeasonModifiers(state)
  const grouped = {}
  BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0
    if (count > 0 && b.growthTime) {
      const effectiveGrowth = b.growthTime * mods.farmingSpeed
      const effectiveHarvest =
        b.harvestAmount * mods.farmingYield * b.yieldValue
      const res = b.resource
      grouped[res] = grouped[res] || []
      grouped[res].push({
        amountPerHarvest: effectiveHarvest * count,
        intervalSec: effectiveGrowth,
      })
    }
  })
  Object.entries(grouped).forEach(([res, arr]) => {
    if (arr.length === 1) {
      const r = arr[0]
      summaries[res] = { ...r, label: formatRate(r) }
    } else if (arr.length > 1) {
      const perSec = arr.reduce(
        (sum, r) => sum + r.amountPerHarvest / r.intervalSec,
        0,
      )
      summaries[res] = { perSec, label: `+${perSec.toFixed(2)}/s` }
    } else {
      summaries[res] = { perSec: 0, label: '+0/s' }
    }
  })
  return summaries
}
