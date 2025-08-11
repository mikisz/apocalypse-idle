import { BUILDINGS } from '../data/buildings.js'
import { getSeason, getSeasonMultiplier } from '../engine/time.js'
import { formatRate } from '../utils/format.js'

export function getCapacity(state, resourceId) {
  const storage = state.storage?.[resourceId] || { base: 0, fromBuildings: 0 }
  return (storage.base || 0) + (storage.fromBuildings || 0)
}

export function getResourceProductionSummary(state) {
  const season = getSeason(state)
  const groupedCategories = {}
  const groupedTypes = {}
  BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0
    if (count > 0 && b.growthTime) {
      const mods = getSeasonMultiplier(season, b.resource, b)
      const effectiveGrowth = b.growthTime * mods.speed
      const effectiveHarvest =
        b.harvestAmount * mods.yield * b.yieldValue
      const res = b.resource
      groupedCategories[res] = groupedCategories[res] || []
      groupedCategories[res].push({
        amountPerHarvest: effectiveHarvest * count,
        intervalSec: effectiveGrowth,
      })
      const type = b.type
      groupedTypes[type] = groupedTypes[type] || []
      groupedTypes[type].push({
        amountPerHarvest: effectiveHarvest * count,
        intervalSec: effectiveGrowth,
      })
    }
  })

  const summaries = { categories: {}, types: {} }
  const build = (group, target) => {
    Object.entries(group).forEach(([key, arr]) => {
      if (arr.length === 1) {
        const r = arr[0]
        target[key] = { ...r, label: formatRate(r) }
      } else if (arr.length > 1) {
        const perSec = arr.reduce(
          (sum, r) => sum + r.amountPerHarvest / r.intervalSec,
          0,
        )
        target[key] = { perSec, label: `+${perSec.toFixed(2)}/s` }
      } else {
        target[key] = { perSec: 0, label: '+0/s' }
      }
    })
  }
  build(groupedCategories, summaries.categories)
  build(groupedTypes, summaries.types)
  return summaries
}
