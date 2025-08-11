import { BALANCE, XP_TIME_TO_NEXT_LEVEL_SECONDS, ROLE_BONUS_PER_SETTLER } from '../data/balance.js'

// Utility clamp
function clamp(v, min, max) {
  if (!Number.isFinite(v)) v = 0
  if (!Number.isFinite(max)) return Math.max(min, v)
  return Math.max(min, Math.min(max, v))
}

export function computeRoleBonuses(settlers) {
  const bonuses = {}
  settlers.forEach((s) => {
    if (s.isDead || !s.role) return
    const skill = s.skills?.[s.role] || { level: 0 }
    const bonus = ROLE_BONUS_PER_SETTLER(skill.level)
    bonuses[s.role] = (bonuses[s.role] || 0) + bonus
  })
  return bonuses
}

export function assignmentsSummary(settlers) {
  const living = settlers.filter((s) => !s.isDead)
  const assigned = living.filter((s) => s.role != null)
  return { assigned: assigned.length, living: living.length }
}

export function processSettlersTick(state, seconds = BALANCE.TICK_SECONDS, totalFoodProdBase = 0, rng = Math.random) {
  const settlers = state.population?.settlers ? [...state.population.settlers] : []
  const starvationTimer = state.colony?.starvationTimerSeconds || 0
  const colony = { ...(state.colony || {}), starvationTimerSeconds: starvationTimer }

  const living = settlers.filter((s) => !s.isDead)

  // Compute bonuses
  const bonuses = computeRoleBonuses(living)
  const totalFoodBonusPercent = bonuses['farming'] || 0

  const totalFoodProdWithBonus = totalFoodProdBase * (1 + totalFoodBonusPercent / 100)
  const totalSettlersConsumption = living.length * BALANCE.FOOD_CONSUMPTION_PER_SETTLER
  const netFoodPerSec = totalFoodProdWithBonus - totalSettlersConsumption

  colony.foodStorage = clamp(
    colony.foodStorage + netFoodPerSec * seconds,
    0,
    colony.foodStorageCap,
  )

  if (colony.foodStorage > 0) {
    colony.starvationTimerSeconds = 0
  } else {
    colony.starvationTimerSeconds += seconds
    if (colony.starvationTimerSeconds >= BALANCE.STARVATION_DEATH_TIMER_SECONDS) {
      const oldest = Math.max(...living.map((s) => s.ageSeconds))
      const victims = living.filter((s) => s.ageSeconds === oldest)
      if (victims.length > 0) {
        const idx = Math.floor(rng() * victims.length)
        const victim = victims[idx]
        const victimIndex = settlers.findIndex((s) => s.id === victim.id)
        if (victimIndex >= 0) {
          settlers[victimIndex] = {
            ...settlers[victimIndex],
            isDead: true,
            role: null,
          }
        }
      }
      colony.starvationTimerSeconds = 0
    }
  }

  // Aging and XP
  for (const s of settlers) {
    if (!s.isDead) {
      s.ageSeconds = (s.ageSeconds || 0) + seconds
      if (s.role) {
        if (!s.skills) s.skills = {}
        const entry = s.skills[s.role] || { level: 0, xp: 0 }
        if (entry.level < BALANCE.MAX_LEVEL) {
          entry.xp = (entry.xp || 0) + BALANCE.XP_GAIN_PER_SECOND_ACTIVE * seconds
          let lvl = entry.level
          let xp = entry.xp
          while (lvl < BALANCE.MAX_LEVEL) {
            const threshold = XP_TIME_TO_NEXT_LEVEL_SECONDS(lvl)
            if (xp >= threshold) {
              xp -= threshold
              lvl += 1
            } else {
              break
            }
            if (lvl >= BALANCE.MAX_LEVEL) {
              xp = Math.min(
                xp,
                XP_TIME_TO_NEXT_LEVEL_SECONDS(BALANCE.MAX_LEVEL - 1) - 1,
              )
              break
            }
          }
          entry.level = lvl
          entry.xp = xp
        }
        s.skills[s.role] = entry
      }
    }
  }

  const telemetry = {
    netFoodPerSec,
    totalFoodProdBase,
    totalFoodBonusPercent,
    totalSettlersConsumption,
    foodStorage: colony.foodStorage,
    starvationTimerSeconds: colony.starvationTimerSeconds,
    roleBonuses: bonuses,
  }

  return {
    state: { ...state, colony, population: { ...state.population, settlers } },
    telemetry,
  }
}
