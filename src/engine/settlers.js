import {
  BALANCE,
  XP_TIME_TO_NEXT_LEVEL_SECONDS,
  ROLE_BONUS_PER_SETTLER,
} from '../data/balance.js';
import { getCapacity } from '../state/selectors.js';
import { clampResource } from './production.js';
import { SECONDS_PER_DAY } from './time.js';

export function computeRoleBonuses(settlers) {
  const bonuses = {};
  settlers.forEach((s) => {
    if (s.isDead || !s.role) return;
    const skill = s.skills?.[s.role] || { level: 0 };
    const bonus = ROLE_BONUS_PER_SETTLER(skill.level) * 100;
    bonuses[s.role] = (bonuses[s.role] || 0) + bonus;
  });
  return bonuses;
}

export function assignmentsSummary(settlers) {
  const living = settlers.filter((s) => !s.isDead);
  const assigned = living.filter((s) => s.role != null);
  return { assigned: assigned.length, living: living.length };
}

export function processSettlersTick(
  state,
  seconds = BALANCE.TICK_SECONDS,
  bonusFoodPerSec = 0,
  rng = Math.random,
  roleBonuses = null,
) {
  const settlers = state.population?.settlers
    ? [...state.population.settlers]
    : [];
  const living = settlers.filter((s) => !s.isDead);

  // Compute bonuses
  const bonuses = roleBonuses || computeRoleBonuses(living);
  const totalFoodBonusPercent = bonuses['farmer'] || 0;

  const bonusGainPerSec = bonusFoodPerSec;
  const totalSettlersConsumption =
    living.length * BALANCE.FOOD_CONSUMPTION_PER_SETTLER;
  // Final food change per second after bonuses and consumption
  const netFoodPerSec = bonusGainPerSec - totalSettlersConsumption;

  const capacity = getCapacity(state, 'potatoes');
  const currentEntry = state.resources.potatoes || {
    amount: 0,
    discovered: false,
    produced: 0,
  };
  // Potatoes after this tick: current amount + netFoodPerSec * seconds (clamped to capacity)
  const nextAmount = clampResource(
    currentEntry.amount + netFoodPerSec * seconds,
    capacity,
  );
  const resources = {
    ...state.resources,
    potatoes: {
      amount: nextAmount,
      discovered: currentEntry.discovered || nextAmount > 0,
      produced: currentEntry.produced,
    },
  };

  let starvationTimer = state.colony?.starvationTimerSeconds || 0;
  if (nextAmount > 0) {
    starvationTimer = 0;
  } else {
    starvationTimer += seconds;
    if (starvationTimer >= BALANCE.STARVATION_DEATH_TIMER_SECONDS) {
      const oldest = Math.max(...living.map((s) => s.ageDays || 0));
      const victims = living.filter((s) => (s.ageDays || 0) === oldest);
      if (victims.length > 0) {
        const idx = Math.floor(rng() * victims.length);
        const victim = victims[idx];
        const victimIndex = settlers.findIndex((s) => s.id === victim.id);
        if (victimIndex >= 0) {
          settlers[victimIndex] = {
            ...settlers[victimIndex],
            isDead: true,
            role: null,
          };
        }
      }
      starvationTimer = 0;
    }
  }
  const colony = { ...state.colony, starvationTimerSeconds: starvationTimer };

  // Aging and XP
  for (const s of settlers) {
    if (!s.isDead) {
      s.ageDays = (s.ageDays || 0) + seconds / SECONDS_PER_DAY;
      if (s.role) {
        if (!s.skills) s.skills = {};
        const entry = s.skills[s.role] || { level: 0, xp: 0 };
        if (entry.level < BALANCE.MAX_LEVEL) {
          entry.xp =
            (entry.xp || 0) + BALANCE.XP_GAIN_PER_SECOND_ACTIVE * seconds;
          let lvl = entry.level;
          let xp = entry.xp;
          while (lvl < BALANCE.MAX_LEVEL) {
            const threshold = XP_TIME_TO_NEXT_LEVEL_SECONDS(lvl);
            if (xp >= threshold) {
              xp -= threshold;
              lvl += 1;
            } else {
              break;
            }
            if (lvl >= BALANCE.MAX_LEVEL) {
              xp = Math.min(
                xp,
                XP_TIME_TO_NEXT_LEVEL_SECONDS(BALANCE.MAX_LEVEL - 1) - 1,
              );
              break;
            }
          }
          entry.level = lvl;
          entry.xp = xp;
        }
        s.skills[s.role] = entry;
      }
    }
  }

  const telemetry = {
    netFoodPerSec,
    bonusFoodPerSec: bonusGainPerSec,
    totalFoodBonusPercent,
    totalSettlersConsumption,
    potatoes: nextAmount,
    starvationTimerSeconds: starvationTimer,
    roleBonuses: bonuses,
  };

  return {
    state: {
      ...state,
      colony,
      resources,
      population: { ...state.population, settlers },
    },
    telemetry,
  };
}
