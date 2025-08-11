export const SECONDS_PER_DAY = 3 // easy customization of day length

const DEFAULT_SEASONS = [
  {
    id: 'spring',
    label: 'Spring',
    icon: '🌱',
    days: 90,
    modifiers: {
      farmingSpeed: 0.8,
      farmingYield: 1.1,
      workSpeed: 0.8,
      workYield: 1.1,
      smeltingSpeed: 1.0,
      smeltingYield: 1.0,
      seasonRain: 1.0,
    },
  },
  {
    id: 'summer',
    label: 'Summer',
    icon: '☀️',
    days: 90,
    modifiers: {
      farmingSpeed: 1.0,
      farmingYield: 1.0,
      workSpeed: 1.0,
      workYield: 1.0,
      smeltingSpeed: 1.0,
      smeltingYield: 1.0,
      seasonRain: 1.0,
    },
  },
  {
    id: 'autumn',
    label: 'Autumn',
    icon: '🍂',
    days: 90,
    modifiers: {
      farmingSpeed: 1.1,
      farmingYield: 1.0,
      workSpeed: 1.1,
      workYield: 1.0,
      smeltingSpeed: 1.0,
      smeltingYield: 1.0,
      seasonRain: 1.0,
    },
  },
  {
    id: 'winter',
    label: 'Winter',
    icon: '❄️',
    days: 90,
    modifiers: {
      farmingSpeed: 2.0,
      farmingYield: 0.0,
      workSpeed: 2.0,
      workYield: 0.0,
      smeltingSpeed: 1.0,
      smeltingYield: 1.0,
      seasonRain: 1.0,
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

export function getSeasonMultiplier(season, building) {
  const speedKey = building?.seasonSpeedKey
  const yieldKey = building?.seasonYieldKey
  const speed = season?.modifiers?.[speedKey] ?? 1
  const yieldMult = season?.modifiers?.[yieldKey] ?? 1
  return { speed, yield: yieldMult }
}

