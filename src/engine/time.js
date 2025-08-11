const DEFAULT_SEASONS = [
  {
    id: 'spring',
    label: 'Spring',
    icon: '🌱',
    duration: 60,
    modifiers: { farmingSpeed: 0.8, farmingYield: 1.1 },
  },
  {
    id: 'summer',
    label: 'Summer',
    icon: '☀️',
    duration: 60,
    modifiers: { farmingSpeed: 1.0, farmingYield: 1.0 },
  },
  {
    id: 'autumn',
    label: 'Autumn',
    icon: '🍂',
    duration: 60,
    modifiers: { farmingSpeed: 1.1, farmingYield: 1.0 },
  },
  {
    id: 'winter',
    label: 'Winter',
    icon: '❄️',
    duration: 60,
    modifiers: { farmingSpeed: 2.0, farmingYield: 0.0 },
  },
]

export function initSeasons() {
  // Return a copy so callers can't mutate the defaults
  return DEFAULT_SEASONS.map((s) => ({ ...s }))
}

export function getSeason(state) {
  const seasons = state?.meta?.seasons || DEFAULT_SEASONS
  const seconds = state?.gameTime?.seconds || 0
  const total = seasons.reduce((sum, s) => sum + s.duration, 0)
  let t = seconds % total
  for (const s of seasons) {
    if (t < s.duration) {
      const { id, label, icon } = s
      return { id, label, icon }
    }
    t -= s.duration
  }
  return { id: 'unknown', label: 'Unknown', icon: '❔' }
}

export function getSeasonModifiers(state) {
  const seasons = state?.meta?.seasons || DEFAULT_SEASONS
  const current = getSeason(state)
  const season = seasons.find((s) => s.id === current.id)
  return season?.modifiers || { farmingSpeed: 1, farmingYield: 1 }
}

