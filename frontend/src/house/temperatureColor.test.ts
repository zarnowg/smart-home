import { describe, expect, it } from 'vitest'
import { NO_DATA_COLOR, temperatureColor } from './temperatureColor'

describe('temperatureColor', () => {
  it('givenTemperaturesOutsideScale_whenColor_thenClampsToColdAndHotEnds', () => {
    // given
    const cold = 5
    const hot = 95

    // when
    const colors = [temperatureColor(cold), temperatureColor(hot)]

    // then
    expect(colors).toEqual(['hsl(220, 75%, 50%)', 'hsl(0, 75%, 50%)'])
  })

  it('givenMiddleTemperature_whenColor_thenReturnsMiddleHue', () => {
    // given
    const value = 50

    // when
    const color = temperatureColor(value)

    // then
    expect(color).toBe('hsl(110, 75%, 50%)')
  })

  it('givenNoValue_whenColor_thenReturnsGray', () => {
    // given
    const value = null

    // when
    const color = temperatureColor(value)

    // then
    expect(color).toBe(NO_DATA_COLOR)
  })
})
