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
    resources[res] = (resources[res] || 0) + rate * seconds
  })
  return { ...state, resources }
}

export function applyOfflineProgress(state, elapsedSeconds) {
  if (elapsedSeconds <= 0) return { state, gains: {} }
  const nextState = processTick(state, elapsedSeconds)
  const gains = {}
  Object.keys(nextState.resources).forEach((res) => {
    const gain = nextState.resources[res] - (state.resources[res] || 0)
    if (gain > 0) gains[res] = gain
  })
  return { state: nextState, gains }
}
