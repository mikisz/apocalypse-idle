export interface Season {
  id: string;
  label: string;
  icon: string;
  multipliers: Record<string, number>;
}

export interface TimeBreakdown {
  year: number;
  day: number;
  season: Season;
  secondsInSeason: number;
}

// Seconds per season.
export const SEASON_DURATION = 270; // seconds per season

export const SEASONS: Season[] = [
  {
    id: 'spring',
    label: 'Spring',
    icon: '🌱',
    multipliers: { FOOD: 1.25, RAW: 1.1 },
  },
  {
    id: 'summer',
    label: 'Summer',
    icon: '☀️',
    multipliers: { FOOD: 1.0, RAW: 1.0 },
  },
  {
    id: 'autumn',
    label: 'Autumn',
    icon: '🍂',
    multipliers: { FOOD: 0.85, RAW: 0.9 },
  },
  {
    id: 'winter',
    label: 'Winter',
    icon: '❄️',
    multipliers: { FOOD: 0.0, RAW: 0.8 },
  },
];

// Each season lasts 90 days for a 360-day year
export const DAYS_PER_SEASON = 90;
export const DAYS_PER_YEAR = DAYS_PER_SEASON * SEASONS.length;
export const SECONDS_PER_DAY = SEASON_DURATION / DAYS_PER_SEASON;

/**
 * Create a copy of all seasons for state initialization.
 * @returns {Season[]}
 */
export function initSeasons(): Season[] {
  return SEASONS.map((s) => ({ ...s }));
}

// Derive temporal information from game state.
export function getTimeBreakdown(
  state: { gameTime?: { seconds: number } } | undefined,
): TimeBreakdown {
  const seconds = state?.gameTime?.seconds || 0;
  const seasonIndex = Math.floor(seconds / SEASON_DURATION) % SEASONS.length;
  const season = SEASONS[seasonIndex];
  const yearDuration = SEASON_DURATION * SEASONS.length;
  const year = Math.floor(seconds / yearDuration) + 1;
  const secondsInSeason = seconds % SEASON_DURATION;
  const day = Math.floor(secondsInSeason / SECONDS_PER_DAY);
  return { year, day, season, secondsInSeason };
}

export function getYear(state: { gameTime?: { seconds: number } }): number {
  return getTimeBreakdown(state).year;
}

export function getSeason(state: { gameTime?: { seconds: number } }): Season {
  return getTimeBreakdown(state).season;
}

export function getSeasonMultiplier(
  season: Season | undefined,
  category: string,
): number {
  return season?.multipliers?.[category] ?? 1;
}

export function getSeasonModifiers(
  state: { gameTime?: { seconds: number } },
): Record<string, number> {
  return getSeason(state).multipliers || {};
}
