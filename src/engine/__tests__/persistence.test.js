import { describe, expect, test } from 'vitest'
import {
  applyMigrations,
  validateSave,
  load,
  save,
  CURRENT_SAVE_VERSION,
} from '../persistence.js'

describe('persistence migrations', () => {
  test('upgrades v1 saves to v2', () => {
    const v1 = {
      version: 1,
      gameTime: 5,
      resources: {},
      buildings: {},
      population: {},
    }
    const migrated = applyMigrations({ ...v1 })
    expect(migrated.version).toBe(2)
    expect(migrated.gameTime).toEqual({ seconds: 5 })
  })
})

describe('validateSave', () => {
  test('throws when required keys missing', () => {
    expect(() =>
      validateSave({ version: 2, buildings: {}, population: {} }),
    ).toThrow(/resources/)
  })

  test('throws when types invalid', () => {
    expect(() =>
      validateSave({
        version: 2,
        resources: [],
        buildings: {},
        population: {},
      }),
    ).toThrow(/resources must be object/)
  })
})

describe('load', () => {
  test('migrates v1 save to current version', () => {
    const v1 = {
      version: 1,
      gameTime: 7,
      resources: {},
      buildings: {},
      population: {},
    }
    const { state, migratedFrom } = load(v1)
    expect(state.version).toBe(CURRENT_SAVE_VERSION)
    expect(state.gameTime).toEqual({ seconds: 7 })
    expect(migratedFrom).toBe(1)
  })

  test('throws on bad input', () => {
    expect(() => load('{')).toThrow()
  })
})

describe('export/import helpers', () => {
  test('save produces JSON-friendly object', () => {
    const saved = save({
      resources: {},
      buildings: {},
      population: {},
      gameTime: { seconds: 0 },
    })
    expect(saved.version).toBe(CURRENT_SAVE_VERSION)
    expect(() => JSON.stringify(saved)).not.toThrow()
  })
})

