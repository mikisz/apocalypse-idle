import { describe, expect, test, beforeEach } from 'vitest'
import { saveGame, loadGame, SCHEMA_VERSION } from '../persistence.js'

describe('persistence engine', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('saves and loads game state', () => {
    const state = { foo: 'bar' }
    const saved = saveGame(state)
    expect(saved.schemaVersion).toBe(SCHEMA_VERSION)
    const loaded = loadGame()
    expect(loaded.foo).toBe('bar')
    expect(loaded.schemaVersion).toBe(SCHEMA_VERSION)
  })

  test('returns null when schema version mismatches', () => {
    localStorage.setItem(
      'apocalypse-idle-save',
      JSON.stringify({ schemaVersion: SCHEMA_VERSION + 1 }),
    )
    expect(loadGame()).toBeNull()
  })
})
