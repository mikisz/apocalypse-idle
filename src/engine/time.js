export const SECONDS_PER_DAY = 3 // easy customization of day length

const DEFAULT_SEASONS = [
  {
    id: 'spring',
    label: 'Spring',
    icon: '🌱',
    days: 90,
    modifiers: {
      food: { speed: 0.8, yield: 1.1 },
      wood: { speed: 0.8, yield: 1.1 },
    },
  },
  {
    id: 'summer',
    label: 'Summer',
    icon: '☀️',
    days: 90,
    modifiers: {
      food: { speed: 1.0, yield: 1.0 },
      wood: { speed: 1.0, yield: 1.0 },
    },
  },
  {
    id: 'autumn',
    label: 'Autumn',
    icon: '🍂',
    days: 90,
    modifiers: {
      food: { speed: 1.1, yield: 1.0 },
      wood: { speed: 1.1, yield: 1.0 },
    },
  },
  {
    id: 'winter',
    label: 'Winter',
    icon: '❄️',
    days: 90,
    modifiers: {
      food: { speed: 2.0, yield: 0.0 },
      wood: { speed: 2.0, yield: 0.0 },
    },
  },
]

export function initSeasons() {
  // Return a copy so callers can't mutate the defaults
  return DEFAULT_SEASONS.map((s) => ({ ...s }))
}

function getSeasons(state) {
  return state?.meta?.seasons || DEFAULT_SEASONS
}

function getYearDuration(seasons) {
  return (
    seasons.reduce((sum, s) => sum + s.days * SECONDS_PER_DAY, 0) ||
    SECONDS_PER_DAY
  )
}

export function getTimeBreakdown(state) {
  const seasons = getSeasons(state)
  const seconds = state?.gameTime?.seconds || 0
  const yearDuration = getYearDuration(seasons)
  const year = Math.floor(seconds / yearDuration) + 1
  let t = seconds % yearDuration
  for (const s of seasons) {
    const durationSec = s.days * SECONDS_PER_DAY
    if (t < durationSec) {
      const dayInSeason = Math.floor(t / SECONDS_PER_DAY) + 1
      return {
        year,
        season: { ...s, durationSec },
        dayInSeason,
        secondsInSeason: t,
      }
    }
    t -= durationSec
  }
  return {
    year,
    season: { id: 'unknown', label: 'Unknown', icon: '❔', durationSec: 0, modifiers: {} },
    dayInSeason: 1,
    secondsInSeason: 0,
  }
}

export function getYear(state) {
  return getTimeBreakdown(state).year
}

export function getSeason(state) {
  return getTimeBreakdown(state).season
}

export function getDayInSeason(state) {
  return getTimeBreakdown(state).dayInSeason
}

// Legacy alias
export const getSeasonDay = getDayInSeason

export function getSeasonModifiers(state) {
  return getTimeBreakdown(state).season.modifiers || {}
}

export function getSeasonMultiplier(season, resourceKey, building) {
  const base = season?.modifiers?.[resourceKey] || { speed: 1, yield: 1 }
  let { speed = 1, yield: yieldMult = 1 } = base
  const seasonal = building?.seasonal
  if (seasonal?.mode === 'ignore') {
    speed = 1
    yieldMult = 1
  } else if (seasonal?.mode === 'custom') {
    const custom = seasonal?.modifiers?.[season.id]?.[resourceKey]
    if (typeof custom === 'number') {
      speed = custom
      yieldMult = custom
    }
  }
  return { speed, yield: yieldMult }
}

