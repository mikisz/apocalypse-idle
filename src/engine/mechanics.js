import { resourceDefs } from '../data/resources.js'

// Definicje budynków (data‑driven)
export const buildingDefs = {
  scavengerHut: {
    id: 'scavengerHut',
    name: 'Chata Zbieraczy',
    description: 'Powoli zbiera złom z ruin.',
    cost: { scrap: 50 },
    producesPerSec: { scrap: 0.2 },
    unlockAt: { scrap: 20 }, // pokaż po uzbieraniu 20 złomu
  },
}

// Sumaryczna produkcja/s ze wszystkich budynków
export function computeProductionPerSec(state) {
  const rates = {}
  for (const r of Object.keys(resourceDefs)) rates[r] = 0

  for (const [bId, bState] of Object.entries(state.buildings)) {
    const def = buildingDefs[bId]
    if (!def) continue
    const count = bState.count || 0
    if (!def.producesPerSec) continue
    for (const [resId, per] of Object.entries(def.producesPerSec)) {
      rates[resId] = (rates[resId] || 0) + per * count
    }
  }
  return rates
}

// Warunek widoczności budynku
export function isBuildingVisible(state, bId) {
  const def = buildingDefs[bId]
  if (!def?.unlockAt) return true
  return Object.entries(def.unlockAt).every(
    ([rid, need]) => (state.resources[rid]?.amount || 0) >= need
  )
}
