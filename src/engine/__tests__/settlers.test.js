import { describe, expect, test } from 'vitest'
import { processSettlersTick, computeRoleBonuses, assignmentsSummary } from '../settlers.js'
import { BALANCE, XP_TIME_TO_NEXT_LEVEL_SECONDS } from '../../data/balance.js'

const makeState = (overrides = {}) => ({
  colony: { foodStorage: 0, foodStorageCap: 100, starvationTimerSeconds: 0 },
  population: { settlers: [] },
  ...overrides,
})

const makeSettler = (attrs = {}) => ({ id: String(Math.random()), isDead: false, ageSeconds: 0, role: null, skills: {}, ...attrs })

describe('starvation timer', () => {
  test('resets when food > 0', () => {
    const state = makeState({ colony: { foodStorage: 0, foodStorageCap: 100, starvationTimerSeconds: 30 }, population: { settlers: [makeSettler()] } })
    const { state: next } = processSettlersTick(state, BALANCE.TICK_SECONDS, 1)
    expect(next.colony.starvationTimerSeconds).toBe(0)
  })
})

describe('deaths', () => {
  test('oldest dies with tie break', () => {
    const s1 = makeSettler({ ageSeconds: 200 })
    const s2 = makeSettler({ ageSeconds: 200 })
    const s3 = makeSettler({ ageSeconds: 100 })
    const state = makeState({ colony: { foodStorage: 0, foodStorageCap: 100, starvationTimerSeconds: BALANCE.STARVATION_DEATH_TIMER_SECONDS }, population: { settlers: [s1, s2, s3] } })
    const rng = () => 0.999 // pick last victim among oldest
    const { state: next } = processSettlersTick(state, BALANCE.TICK_SECONDS, 0, rng)
    const dead = next.population.settlers.filter((s) => s.isDead)
    expect(dead).toHaveLength(1)
    expect(dead[0].ageSeconds).toBe(200)
  })
})

describe('bonuses', () => {
  test('recomputed on death and reassignment', () => {
    const s1 = makeSettler({ role: 'farming', skills: { farming: { level: 5, xp: 0 } } })
    const s2 = makeSettler({ role: 'farming', skills: { farming: { level: 5, xp: 0 } } })
    const base = [s1, s2]
    const bonuses1 = computeRoleBonuses(base)
    expect(bonuses1.farming).toBeCloseTo(1)
    base[0].isDead = true
    const bonuses2 = computeRoleBonuses(base)
    expect(bonuses2.farming).toBeCloseTo(0.5)
    base[1].role = null
    const bonuses3 = computeRoleBonuses(base)
    expect(bonuses3.farming || 0).toBe(0)
  })
})

describe('xp and level', () => {
  test('levels up and caps', () => {
    const settler = makeSettler({ role: 'farming', skills: { farming: { level: 1, xp: 0 } } })
    let state = makeState({ colony: { foodStorage: 10, foodStorageCap: 100, starvationTimerSeconds: 0 }, population: { settlers: [settler] } })
    const secs = XP_TIME_TO_NEXT_LEVEL_SECONDS(1)
    ;({ state } = processSettlersTick(state, secs, 1))
    expect(state.population.settlers[0].skills.farming.level).toBe(2)
    // fast forward to max level
    let remaining = 0
    for (let lvl = 2; lvl < BALANCE.MAX_LEVEL; lvl++) {
      remaining += XP_TIME_TO_NEXT_LEVEL_SECONDS(lvl)
    }
    ;({ state } = processSettlersTick(state, remaining, 1))
    const skill = state.population.settlers[0].skills.farming
    expect(skill.level).toBe(BALANCE.MAX_LEVEL)
    expect(skill.xp).toBeLessThan(XP_TIME_TO_NEXT_LEVEL_SECONDS(BALANCE.MAX_LEVEL - 1))
  })
})

describe('assignment summary', () => {
  test('A/B counts', () => {
    const s1 = makeSettler({ role: 'farming' })
    const s2 = makeSettler({ role: null })
    const s3 = makeSettler({ isDead: true, role: 'farming' })
    const summary = assignmentsSummary([s1, s2, s3])
    expect(summary.assigned).toBe(1)
    expect(summary.living).toBe(2)
  })
})
