export const BALANCE = {
  TICK_SECONDS: 1,
  FOOD_CONSUMPTION_PER_SETTLER: 0.4,
  STARVATION_DEATH_TIMER_SECONDS: 90,
  MAX_LEVEL: 20,
  XP_GAIN_PER_SECOND_ACTIVE: 0.25,
  HAPPINESS_BASE: 50,
  HAPPINESS_OVERCR_PENALTY_PER: 5,
};

export const ROLE_LINE_BONUS_CAP = 0.3; // added cap per line

export function XP_TIME_TO_NEXT_LEVEL_SECONDS(level) {
  return Math.round(22.5 * Math.pow(1.8, level - 1)); // changed: 15 -> 22.5
}

export function ROLE_BONUS_PER_SETTLER(level) {
  return Math.min(0.005 * level, 0.025); // changed: 0.02*level→min(0.005*level,0.025)
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
