import { describe, expect, it } from 'vitest'
import { HISTORY_RANGES, rangeWindow, seriesStats } from './historyMetrics'

describe('historyMetrics', () => {
  it('givenSixHourRange_whenWindowCalculated_thenFromIsSixHoursBeforeToInLocalIso', () => {
    // given
    const range = HISTORY_RANGES.find((item) => item.hours === 6)!
    const now = new Date(2025, 0, 15, 14, 30, 45)

    // when
    const window = rangeWindow(range, now)

    // then
    expect(window.from).toBe('2025-01-15T08:30:00')
    expect(window.to).toBe('2025-01-15T14:30:00')
  })

  it('givenValuesWithGaps_whenStatsCalculated_thenIgnoresNullsAndLastIsLatestValue', () => {
    // given
    const values = [10, null, 20, 30, null]

    // when
    const stats = seriesStats(values)

    // then
    expect(stats).toEqual({ last: 30, min: 10, max: 30, average: 20 })
  })

  it('givenOnlyNulls_whenStatsCalculated_thenAllStatsAreNull', () => {
    // given
    const values = [null, null]

    // when
    const stats = seriesStats(values)

    // then
    expect(stats.last).toBeNull()
    expect(stats.average).toBeNull()
  })
})
