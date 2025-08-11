import { FOOD_BUILDINGS } from '../data/farms.js'
import { getSeasonModifiers } from '../engine/time.js'
import { formatRate } from '../utils/format.js'

export function getCapacity(state, resourceId) {
  const storage = state.storage?.[resourceId] || { base: 0, fromBuildings: 0 }
  return (storage.base || 0) + (storage.fromBuildings || 0)
}

export function getResourceProductionSummary(state) {
  const summaries = {}
  const mods = getSeasonModifiers(state)
  const buildings = FOOD_BUILDINGS
  const results = []
  buildings.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0
    if (count > 0) {
      const effectiveGrowth = b.growthTime * mods.farmingSpeed
      const effectiveHarvest = b.harvestAmount * mods.farmingYield * b.foodValue
      results.push({
        amountPerHarvest: effectiveHarvest * count,
        intervalSec: effectiveGrowth,
      })
    }
  })
  if (results.length === 1) {
    const r = results[0]
    summaries.food = { ...r, label: formatRate(r) }
  } else if (results.length > 1) {
    const perSec = results.reduce(
      (sum, r) => sum + r.amountPerHarvest / r.intervalSec,
      0,
    )
    summaries.food = { perSec, label: `+${perSec.toFixed(2)}/s` }
  } else {
    summaries.food = { perSec: 0, label: '+0/s' }
  }
  return summaries
}
