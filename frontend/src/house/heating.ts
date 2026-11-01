import type { MixerStatus } from '../api/types'
import { formatOnOff, formatTemperature } from '../format'
import type { HeatingCircuit } from './houseConfig'

export function findMixer(mixers: MixerStatus[] | undefined, id: number): MixerStatus | undefined {
  return mixers?.find((mixer) => mixer.id === id)
}

export function circuitSummary(circuit: HeatingCircuit, mixer: MixerStatus | undefined): string {
  return (
    `${circuit.name}: ${formatTemperature(mixer?.temperature)} ` +
    `(zadana ${formatTemperature(mixer?.targetTemperature)}) · pompa ${formatOnOff(mixer?.pump)}`
  )
}
