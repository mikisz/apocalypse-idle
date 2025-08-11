import { BUILDINGS } from '../data/buildings.js'
import { getSeason, getSeasonMultiplier } from './time.js'
import { getCapacity } from '../state/selectors.js'

export function getProductionRates(state) {
  const rates = { food: 0, wood: 0 }
  const settlers = state.population?.settlers ?? []
  settlers.forEach((s) => {
    if (s.role === 'farming') rates.food += 1 + s.skills.farming * 0.1
    if (s.role === 'scavenging')
      rates.wood += 1 + s.skills.scavenging * 0.1
  })
  const buildings = state.buildings || {}
  Object.values(buildings).forEach((b) => {
    if (b.resource && b.rate) {
      rates[b.resource] = (rates[b.resource] || 0) + b.rate * (b.count || 1)
    }
  })
  return rates
}

export function processTick(state, seconds = 1) {
  const rates = getProductionRates(state)
  const resources = {}
  Object.entries(state.resources).forEach(([key, val]) => {
    resources[key] = { ...val, stocks: { ...(val.stocks || {}) } }
  })
  Object.entries(rates).forEach(([res, rate]) => {
    const capacity = getCapacity(state, res)
    const current = resources[res]?.amount || 0
    const nextAmount = Math.max(
      0,
      Math.min(capacity, current + rate * seconds),
    )
    const delta = nextAmount - current
    const stocks = resources[res]?.stocks || {}
    stocks.misc = (stocks.misc || 0) + delta
    resources[res] = { amount: nextAmount, capacity, stocks }
  })

  const season = getSeason(state)
  const timers = { ...state.timers }

  BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0
    if (count <= 0 || !b.growthTime) return
    const resId = b.resource
    const type = b.type
    const mods = getSeasonMultiplier(season, resId, b)
    const effectiveGrowth = b.growthTime * mods.speed
    const effectiveHarvest = b.harvestAmount * mods.yield * b.yieldValue
    const group = { ...(timers[resId] || {}) }
    let timer = (group[b.id] ?? effectiveGrowth) - seconds
    let cycles = 0
    while (timer <= 0) {
      cycles++
      timer += effectiveGrowth
    }
    if (cycles > 0) {
      const capacity = getCapacity(state, resId)
      const current = resources[resId]?.amount || 0
      let next = current + effectiveHarvest * count * cycles
      if (next > capacity) next = capacity
      const gain = next - current
      const stocks = resources[resId]?.stocks || {}
      const subCurrent = stocks[type] || 0
      stocks[type] = subCurrent + gain
      resources[resId] = { amount: next, capacity, stocks }
    }
    group[b.id] = timer
    timers[resId] = group
  })

  return { ...state, resources, timers }
}

export function applyOfflineProgress(state, elapsedSeconds) {
  if (elapsedSeconds <= 0) return { state, gains: {} }
  const nextState = processTick(state, elapsedSeconds)
  const gains = {}
  Object.keys(nextState.resources).forEach((res) => {
    const gain =
      (nextState.resources[res]?.amount || 0) -
      (state.resources[res]?.amount || 0)
    if (gain > 0) gains[res] = gain
  })
  return { state: nextState, gains }
}

export function demolishBuilding(state, buildingId) {
  const blueprint = BUILDINGS.find((b) => b.id === buildingId)
  const count = state.buildings?.[buildingId]?.count || 0
  if (!blueprint || count <= 0) return state
  const refundRatio = blueprint.demolishRefundRatio ?? 0.5
  const resources = { ...state.resources }
  Object.entries(blueprint.cost || {}).forEach(([res, amt]) => {
    const refund = Math.floor(amt * refundRatio)
    const capacity = getCapacity(state, res)
    const current = state.resources[res]?.amount || 0
    const next = Math.min(capacity, current + refund)
    const stocks = { ...(state.resources[res]?.stocks || {}) }
    const key = Object.keys(stocks)[0] || res
    stocks[key] = (stocks[key] || 0) + refund
    resources[res] = { ...state.resources[res], amount: next, stocks }
  })
  const buildings = {
    ...state.buildings,
    [buildingId]: { ...(state.buildings[buildingId] || {}), count: count - 1 },
  }
  let timers = { ...state.timers }
  if (blueprint.growthTime) {
    const group = { ...(state.timers?.[blueprint.resource] || {}) }
    if (count - 1 <= 0) delete group[buildingId]
    timers = { ...state.timers, [blueprint.resource]: group }
  }
  return { ...state, resources, buildings, timers }
}
