import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { BOILER_STATUS, MIXER } from '../../test/fixtures'
import { temperatureColor } from '../temperatureColor'
import { BoilerSchematic } from './BoilerSchematic'

describe('BoilerSchematic', () => {
  afterEach(cleanup)

  it('givenWorkingBoiler_whenRendered_thenShowsFlameRunningPumpAndFuelLevel', () => {
    // given
    const status = { ...BOILER_STATUS, boilerPowerPercent: 60, boilerPump: true, fuelLevel: 75 }

    // when
    render(<BoilerSchematic status={status} mixers={[]} />)

    // then
    expect(screen.getByRole('img', { name: 'Płomień, moc 60 %' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Pompa CO: pracuje' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Zasobnik paliwa: 75 %' })).toBeTruthy()
  })

  it('givenZeroPower_whenRendered_thenHidesFlame', () => {
    // given
    const status = { ...BOILER_STATUS, boilerPowerPercent: 0 }

    // when
    render(<BoilerSchematic status={status} mixers={[]} />)

    // then
    expect(screen.queryByRole('img', { name: /Płomień/ })).toBeNull()
  })

  it('givenBufferTemperatures_whenRendered_thenGradientGoesFromUpperToLowerColor', () => {
    // given
    const status = { ...BOILER_STATUS, upperBufferTemperature: 70, lowerBufferTemperature: 30 }

    // when
    render(<BoilerSchematic status={status} mixers={[]} />)

    // then
    const stops = screen.getByRole('img', { name: /^Bufor/ }).querySelectorAll('stop')
    expect([...stops].map((stop) => stop.getAttribute('stop-color'))).toEqual([
      temperatureColor(70),
      temperatureColor(30),
    ])
  })

  it('givenMixerTwo_whenRendered_thenShowsItAsGroundFloorCircuit', () => {
    // given
    const mixers = [MIXER]

    // when
    render(<BoilerSchematic status={BOILER_STATUS} mixers={mixers} />)

    // then
    expect(screen.getByRole('img', { name: 'Mieszacz 2 → Parter: 35,5 °C (40 °C)' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Pompa M2: pracuje' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Pompa M1: brak danych' })).toBeTruthy()
  })
})
