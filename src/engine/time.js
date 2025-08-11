export const SEASON_DURATION = 270; // seconds per season

export const SEASONS = [
  { id: 'spring', label: 'Spring', icon: '🌱', multipliers: { FOOD: 1.25, RAW: 1.1 } },
  { id: 'summer', label: 'Summer', icon: '☀️', multipliers: { FOOD: 1.0, RAW: 1.0 } },
  { id: 'autumn', label: 'Autumn', icon: '🍂', multipliers: { FOOD: 0.85, RAW: 0.9 } },
  { id: 'winter', label: 'Winter', icon: '❄️', multipliers: { FOOD: 0.0, RAW: 0.8 } },
];

export function initSeasons() {
  return SEASONS.map((s) => ({ ...s }));
}

export function getTimeBreakdown(state) {
  const seconds = state?.gameTime?.seconds || 0;
  const seasonIndex = Math.floor(seconds / SEASON_DURATION) % SEASONS.length;
  const season = SEASONS[seasonIndex];
  const year = Math.floor(seconds / (SEASON_DURATION * SEASONS.length)) + 1;
  const secondsInSeason = seconds % SEASON_DURATION;
  return { year, season, secondsInSeason };
}

export function getYear(state) {
  return getTimeBreakdown(state).year;
}

export function getSeason(state) {
  return getTimeBreakdown(state).season;
}

export function getSeasonMultiplier(season, category) {
  return season?.multipliers?.[category] ?? 1;
}

export function getSeasonModifiers(state) {
  return getSeason(state).multipliers || {};
}
