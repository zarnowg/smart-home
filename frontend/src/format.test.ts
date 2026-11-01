import { describe, expect, it } from 'vitest'
import { EMPTY, formatActuator, formatPercent, formatTemperature } from './format'

describe('format', () => {
  it('givenNullValues_whenFormat_thenReturnsDash', () => {
    // given
    const value = null

    // when
    const results = [formatTemperature(value), formatPercent(value), formatActuator(value)]

    // then
    expect(results).toEqual([EMPTY, EMPTY, EMPTY])
  })

  it('givenDecimalTemperature_whenFormatTemperature_thenUsesPolishDecimalComma', () => {
    // given
    const value = 64.25

    // when
    const result = formatTemperature(value)

    // then
    expect(result).toBe('64,3 °C')
  })

  it('givenUnknownActuatorCode_whenFormatActuator_thenReturnsRawValue', () => {
    // given
    const value = 'UNKNOWN_7'

    // when
    const result = formatActuator(value)

    // then
    expect(result).toBe('UNKNOWN_7')
  })
})
