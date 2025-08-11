import { BUILDINGS, getBuildingCost } from '../data/buildings.js'
import { getSeason, getSeasonMultiplier } from './time.js'
import { getCapacity } from '../state/selectors.js'

export function clampResource(value, capacity) {
  let v = Number.isFinite(value) ? value : 0
  let c = Number.isFinite(capacity) ? capacity : 0
  if (!Number.isFinite(value) || !Number.isFinite(capacity)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Invalid resource numbers', value, capacity)
    }
  }
  if (c < 0) c = 0
  const result = Math.max(0, Math.min(c, v))
  return Math.round(result * 1e6) / 1e6
}

export function applyProduction(state, seconds = 1) {
  const resources = { ...state.resources }
  const season = getSeason(state)
  const timers = { ...state.timers }

  BUILDINGS.forEach((b) => {
    const count = state.buildings?.[b.id]?.count || 0
    if (count <= 0 || !b.cycleTimeSec) return
    const resId = b.outputResource
    const mods = getSeasonMultiplier(season, b)
    const effectiveCycle = b.cycleTimeSec * mods.speed
    const effectiveHarvest = b.harvestAmount * b.outputValue * mods.yield
    if (!Number.isFinite(effectiveCycle) || effectiveCycle <= 0) return
    const group = { ...(timers[resId] || {}) }
    let timer = (group[b.id] ?? effectiveCycle) - seconds
    let cycles = 0
    while (timer < 0) {
      cycles++
      timer += effectiveCycle
    }
    if (cycles > 0) {
      const capacity = getCapacity(state, resId)
      const current = resources[resId]?.amount || 0
      let next = current + effectiveHarvest * count * cycles
      next = clampResource(next, capacity)
      resources[resId] = { amount: next }
    }
    group[b.id] = timer
    timers[resId] = group
  })

  return { resources, timers }
}

export function processTick(state, seconds = 1) {
  const { resources, timers } = applyProduction(state, seconds)
  return { ...state, resources, timers }
}

export function applyOfflineProgress(state, elapsedSeconds) {
  if (elapsedSeconds <= 0) return { state, gains: {} }
  const step = 60
  let remaining = elapsedSeconds
  let current = {
    ...state,
    resources: JSON.parse(JSON.stringify(state.resources)),
    timers: JSON.parse(JSON.stringify(state.timers || {})),
  }
  while (remaining > 0) {
    const dt = Math.min(step, remaining)
    const { resources, timers } = applyProduction(current, dt)
    current = {
      ...current,
      resources,
      timers,
      gameTime: {
        ...(current.gameTime || {}),
        seconds: (current.gameTime?.seconds || 0) + dt,
      },
    }
    remaining -= dt
  }
  const gains = {}
  Object.keys(current.resources).forEach((res) => {
    const gain =
      (current.resources[res]?.amount || 0) -
      (state.resources[res]?.amount || 0)
    if (gain > 0) gains[res] = gain
  })
  return { state: current, gains }
}

export function demolishBuilding(state, buildingId) {
  const blueprint = BUILDINGS.find((b) => b.id === buildingId)
  const count = state.buildings?.[buildingId]?.count || 0
  if (!blueprint || count <= 0) return state
  const prevCost = getBuildingCost(blueprint, count - 1)
  const resources = { ...state.resources }
  const buildings = {
    ...state.buildings,
    [buildingId]: { ...(state.buildings[buildingId] || {}), count: count - 1 },
  }
  Object.entries(prevCost).forEach(([res, amt]) => {
    const refund = Math.floor(amt * 0.5)
    const capacity = getCapacity({ ...state, buildings }, res)
    const current = resources[res]?.amount || 0
    const next = Math.min(capacity, current + refund)
    resources[res] = { amount: next }
  })
  let timers = { ...state.timers }
  if (blueprint.cycleTimeSec) {
    const group = { ...(state.timers?.[blueprint.outputResource] || {}) }
    if (count - 1 <= 0) delete group[buildingId]
    timers = { ...state.timers, [blueprint.outputResource]: group }
  }
  // clamp resources after capacity changes
  Object.keys(resources).forEach((res) => {
    const capacity = getCapacity({ ...state, buildings }, res)
    resources[res].amount = clampResource(resources[res].amount, capacity)
  })
  return { ...state, resources, buildings, timers }
}

