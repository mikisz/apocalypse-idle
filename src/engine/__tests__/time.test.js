import { describe, test, expect } from 'vitest'
import { getTimeBreakdown, SECONDS_PER_DAY } from '../time.js'

describe('time engine', () => {
  test('handles season transition at boundaries', () => {
    const secondsPerSeason = 90 * SECONDS_PER_DAY
    const info = getTimeBreakdown({ gameTime: { seconds: secondsPerSeason } })
    expect(info.year).toBe(1)
    expect(info.season.id).toBe('summer')
    expect(info.dayInSeason).toBe(1)
  })

  test('handles large offline progress deltas', () => {
    const info = getTimeBreakdown({ gameTime: { seconds: 10000 } })
    expect(info.year).toBe(10)
    expect(info.season.id).toBe('summer')
    expect(info.dayInSeason).toBe(4)
  })
})
