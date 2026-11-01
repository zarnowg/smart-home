import { vi } from 'vitest'
import type { BoilerStatus, MixerStatus } from '../api/types'

export const BOILER_STATUS: BoilerStatus = {
  boilerTemperature: 65.4,
  feederTemperature: 30,
  outdoorTemperature: -2.5,
  flueGasTemperature: 120,
  hotWaterTemperature: 48,
  upperBufferTemperature: 60,
  lowerBufferTemperature: 40,
  fuelLevel: 75,
  boilerThermostat: false,
  oxygenPercent: 9.1,
  boilerPump: true,
  blower: null,
  feeder: false,
  igniter: false,
  hotWaterPump: false,
  additionalFeeder: false,
  boilerPowerPercent: 50,
  wifi: null,
  serviceCounters: null,
}

export const MIXER: MixerStatus = {
  id: 2,
  temperature: 35.5,
  targetTemperature: 40,
  roomThermostat: true,
  pump: true,
  valvePercent: 30,
  actuator: 'OPENING',
}

export function mockApi(responses: Record<string, () => Response>) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => Promise.resolve(responses[url]?.() ?? new Response(null, { status: 404 }))),
  )
}
