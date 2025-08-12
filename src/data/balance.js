export const BALANCE = {
  TICK_SECONDS: 1,
  FOOD_CONSUMPTION_PER_SETTLER: 0.4,
  STARVATION_DEATH_TIMER_SECONDS: 90,
  MAX_LEVEL: 20,
  XP_GAIN_PER_SECOND_ACTIVE: 0.25,
  HAPPINESS_BASE: 50,
  HAPPINESS_OVERCR_PENALTY_PER: 5,
};

export function XP_TIME_TO_NEXT_LEVEL_SECONDS(level) {
  return Math.round(15 * Math.pow(1.8, level - 1));
}

export function ROLE_BONUS_PER_SETTLER(level) {
  if (level <= 10) return 0.1 * level;
  return 1.0 + 0.05 * (level - 10);
}

export function FOOD_VARIETY_BONUS(count) {
  if (count <= 0) return -20;
  if (count === 1) return 0;
  if (count === 2) return 5;
  if (count === 3) return 10;
  return 15;
}

export function XP_MULTIPLIER_FROM_HAPPINESS(happiness) {
  return 0.5 + happiness / 100;
}
