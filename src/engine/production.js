import { BUILDINGS } from '../data/buildings.js'
import { getSeasonModifiers } from './time.js'
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
    const nextAmount = Math.min(capacity, current + rate * seconds)
    const delta = nextAmount - current
    const stocks = resources[res]?.stocks || {}
    stocks.misc = (stocks.misc || 0) + delta
    resources[res] = { amount: nextAmount, capacity, stocks }
  })

  const mods = getSeasonModifiers(state)
  const timers = { ...state.timers }

  BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0
    if (count <= 0 || !b.growthTime) return
    const resId = b.resource
    const type = b.type
    const effectiveGrowth = b.growthTime * mods.farmingSpeed
    const effectiveHarvest = b.harvestAmount * mods.farmingYield * b.yieldValue
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
