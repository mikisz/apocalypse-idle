import { FOOD_BUILDINGS } from '../data/farms.js'
import { getSeasonModifiers } from './time.js'
import { getCapacity } from '../state/selectors.js'

export function getProductionRates(state) {
  const rates = { food: 0, scrap: 0 }
  const settlers = state.population?.settlers ?? []
  settlers.forEach((s) => {
    if (s.role === 'farming') rates.food += 1 + s.skills.farming * 0.1
    if (s.role === 'scavenging') rates.scrap += 1 + s.skills.scavenging * 0.1
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
  const resources = { ...state.resources }
  Object.entries(rates).forEach(([res, rate]) => {
    const capacity = getCapacity(state, res)
    const current = resources[res]?.amount || 0
    const nextAmount = Math.min(capacity, current + rate * seconds)
    resources[res] = { amount: nextAmount, capacity }
  })

  const mods = getSeasonModifiers(state)
  const timers = { ...(state.timers?.food || {}) }
  let food = resources.food?.amount || 0
  const foodCap = getCapacity(state, 'food')

  FOOD_BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0
    if (count <= 0) return
    const effectiveGrowth = b.growthTime * mods.farmingSpeed
    const effectiveHarvest = b.harvestAmount * mods.farmingYield * b.foodValue
    let timer = (timers[b.id] ?? effectiveGrowth) - seconds
    let cycles = 0
    while (timer <= 0) {
      cycles++
      timer += effectiveGrowth
    }
    if (cycles > 0) {
      food += effectiveHarvest * count * cycles
      if (food > foodCap) food = foodCap
    }
    timers[b.id] = timer
  })

  resources.food = { amount: food, capacity: foodCap }

  return { ...state, resources, timers: { ...state.timers, food: timers } }
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
