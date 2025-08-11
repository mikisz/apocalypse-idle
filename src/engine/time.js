export const SECONDS_PER_DAY = 1 // easy customization of day length

const DEFAULT_SEASONS = [
  {
    id: 'spring',
    label: 'Spring',
    icon: '🌱',
    days: 90,
    modifiers: { farmingSpeed: 0.8, farmingYield: 1.1 },
  },
  {
    id: 'summer',
    label: 'Summer',
    icon: '☀️',
    days: 90,
    modifiers: { farmingSpeed: 1.0, farmingYield: 1.0 },
  },
  {
    id: 'autumn',
    label: 'Autumn',
    icon: '🍂',
    days: 90,
    modifiers: { farmingSpeed: 1.1, farmingYield: 1.0 },
  },
  {
    id: 'winter',
    label: 'Winter',
    icon: '❄️',
    days: 90,
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
  const total =
    seasons.reduce((sum, s) => sum + s.days * SECONDS_PER_DAY, 0) ||
    SECONDS_PER_DAY
  let t = seconds % total
  for (const s of seasons) {
    const duration = s.days * SECONDS_PER_DAY
    if (t < duration) {
      const { id, label, icon } = s
      return { id, label, icon }
    }
    t -= duration
  }
  return { id: 'unknown', label: 'Unknown', icon: '❔' }
}

export function getSeasonModifiers(state) {
  const seasons = state?.meta?.seasons || DEFAULT_SEASONS
  const current = getSeason(state)
  const season = seasons.find((s) => s.id === current.id)
  return season?.modifiers || { farmingSpeed: 1, farmingYield: 1 }
}

export function getSeasonDay(state) {
  const seasons = state?.meta?.seasons || DEFAULT_SEASONS
  const seconds = state?.gameTime?.seconds || 0
  let t = seconds
  for (const s of seasons) {
    const duration = s.days * SECONDS_PER_DAY
    if (t < duration) {
      return Math.floor(t / SECONDS_PER_DAY) + 1
    }
    t -= duration
  }
  return 1
}

