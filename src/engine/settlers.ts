// @ts-nocheck
import {
  BALANCE,
  XP_TIME_TO_NEXT_LEVEL_SECONDS,
  ROLE_BONUS_PER_SETTLER,
  FOOD_VARIETY_BONUS,
  XP_MULTIPLIER_FROM_HAPPINESS,
} from '../data/balance.js';
import { getSettlerCapacity } from '../state/selectors.js';
import { calculateFoodCapacity, ensureCapacityCache } from '../state/capacityCache.ts';
import { SECONDS_PER_DAY } from './time.ts';
import { RESOURCES } from '../data/resources.js';
import { addResource, consumeResource } from './resourceOps.ts';
import { createLogEntry } from '../utils/log.js';

export function computeRoleBonuses(settlers: any[]): Record<string, number> {
  const bonuses: Record<string, number> = {};
  settlers.forEach((s) => {
    if (s.isDead || !s.role) return;
    const skill = s.skills?.[s.role] || { level: 0 };
    const bonus = ROLE_BONUS_PER_SETTLER(skill.level);
    bonuses[s.role] = (bonuses[s.role] || 0) + bonus;
  });
  return bonuses;
}

export function assignmentsSummary(settlers: any[]): { assigned: number; living: number } {
  const living = settlers.filter((s: any) => !s.isDead);
  const assigned = living.filter((s: any) => s.role != null);
  return { assigned: assigned.length, living: living.length };
}

export function processSettlersTick(
  state: any,
  seconds: number = BALANCE.TICK_SECONDS,
  bonusFoodPerSec: number = 0,
  rng: () => number = Math.random,
  roleBonuses: Record<string, number> | null = null,
): { state: any; telemetry: any; events: any[] } {
  ensureCapacityCache(state);
  const settlers = state.population?.settlers
    ? [...state.population.settlers]
    : [];
  const events = [];
  const living = settlers.filter((s) => !s.isDead);

  // Happiness calculation
  const settlerCap = getSettlerCapacity(state);
  const overcrowded = Math.max(0, living.length - settlerCap);
  const overcrowdingPenalty =
    -overcrowded * BALANCE.HAPPINESS_OVERCR_PENALTY_PER;
  const foodTypes = Object.keys(RESOURCES).filter(
    (id) =>
      RESOURCES[id].category === 'FOOD' &&
      (state.resources[id]?.amount || 0) > 0,
  ).length;
  const foodVarietyBonus = FOOD_VARIETY_BONUS(foodTypes);
  const base = BALANCE.HAPPINESS_BASE;
  const happinessValue = Math.min(
    100,
    Math.max(0, base + foodVarietyBonus + overcrowdingPenalty),
  );
  const happinessBreakdown = [
    { label: 'Base', value: base },
    { label: 'Overcrowding', value: overcrowdingPenalty },
    { label: 'Food variety', value: foodVarietyBonus },
  ];
  for (const s of settlers) {
    s.happiness = happinessValue;
    s.happinessBreakdown = happinessBreakdown;
  }
  const xpMultiplier = XP_MULTIPLIER_FROM_HAPPINESS(happinessValue);

  // Compute bonuses
  const bonuses = roleBonuses || computeRoleBonuses(living);
  const totalFoodBonusPercent = (bonuses['farmer'] || 0) * 100;

  const bonusGainPerSec = bonusFoodPerSec;
  const totalSettlersConsumption =
    living.length * BALANCE.FOOD_CONSUMPTION_PER_SETTLER;
  // Final food change per second after bonuses and consumption
  const netFoodPerSec = bonusGainPerSec - totalSettlersConsumption;

  let foodPool = state.foodPool
    ? { ...state.foodPool }
    : {
        amount: Object.keys(state.resources).reduce(
          (sum, id) =>
            sum +
            (RESOURCES[id].category === 'FOOD'
              ? state.resources[id]?.amount || 0
              : 0),
          0,
        ),
        capacity: calculateFoodCapacity(state),
      };
  const resources = { ...state.resources };

  let remaining = totalSettlersConsumption * seconds;
  const foodIds = Object.keys(RESOURCES).filter(
    (id) => RESOURCES[id].category === 'FOOD',
  );
  const prioritized = ['potatoes', ...foodIds.filter((id) => id !== 'potatoes')];
  for (const id of prioritized) {
    if (remaining <= 0) break;
    const consumed = consumeResource(state, resources, id, remaining, foodPool);
    remaining -= consumed;
  }

  const bonusGain = Math.max(0, bonusGainPerSec * seconds);
  addResource(state, resources, 'potatoes', bonusGain, foodPool);

  const foodAmount = foodPool.amount;

  let starvationTimer = state.colony?.starvationTimerSeconds || 0;
  if (foodAmount > 0) {
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
          const updated = {
            ...settlers[victimIndex],
            isDead: true,
            role: null,
          };
          settlers[victimIndex] = updated;
          events.push(
            createLogEntry(
              `${updated.firstName} ${updated.lastName} died`,
            ),
          );
        }
      }
      starvationTimer = 0;
    }
  }
  const colony = {
    ...state.colony,
    starvationTimerSeconds: starvationTimer,
    happiness: { value: happinessValue, breakdown: happinessBreakdown },
  };

  // Aging and XP
  for (const s of settlers) {
    if (!s.isDead) {
      s.ageDays = (s.ageDays || 0) + seconds / SECONDS_PER_DAY;
      if (s.role) {
        if (!s.skills) s.skills = {};
        const entry = s.skills[s.role] || { level: 0, xp: 0 };
        if (entry.level < BALANCE.MAX_LEVEL) {
          entry.xp =
            (entry.xp || 0) +
            BALANCE.XP_GAIN_PER_SECOND_ACTIVE * seconds * xpMultiplier;
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
    potatoes: resources.potatoes.amount,
    starvationTimerSeconds: starvationTimer,
    roleBonuses: bonuses,
  };

  const log =
    events.length > 0
      ? [...events, ...(state.log || [])].slice(0, 100)
      : state.log;

  return {
    state: {
      ...state,
      colony,
      resources,
      foodPool,
      population: { ...state.population, settlers },
      log,
    },
    telemetry,
    events,
  };
}
