import { BUILDINGS } from '../data/buildings.js'
import { RESOURCES } from '../data/resources.js'
import { getSeason, getSeasonMultiplier } from '../engine/time.js'
import { formatRate } from '../utils/format.js'

export function getCapacity(state, resourceId) {
  const base = RESOURCES[resourceId]?.baseCapacity || 0
  let fromBuildings = 0
  BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0
    if (count > 0 && b.addsCapacity?.[resourceId]) {
      fromBuildings += b.addsCapacity[resourceId] * count
    }
  })
  return base + fromBuildings
}

export function getResourceRates(state) {
  const season = getSeason(state)
  const rates = {}
  BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0
    if (count > 0 && b.cycleTimeSec) {
      const mods = getSeasonMultiplier(season, b)
      const perSec =
        ((b.harvestAmount * b.outputValue * mods.yield) /
          (b.cycleTimeSec * mods.speed)) *
        count
      rates[b.outputResource] = (rates[b.outputResource] || 0) + perSec
    }
  })
  const formatted = {}
  Object.keys(RESOURCES).forEach((id) => {
    const perSec = rates[id] || 0
    formatted[id] = {
      perSec,
      label: formatRate({ amountPerHarvest: perSec, intervalSec: 1 }),
    }
  })
  return formatted
}
