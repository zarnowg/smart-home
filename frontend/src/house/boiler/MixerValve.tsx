import type { MixerStatus } from '../../api/types'
import { formatActuator, formatPercent, formatTemperature } from '../../format'
import type { HeatingCircuit } from '../houseConfig'
import styles from './BoilerSchematic.module.css'

interface MixerValveProps {
  x: number
  y: number
  circuit: HeatingCircuit
  floorName: string
  mixer: MixerStatus | undefined
}

export function MixerValve({ x, y, circuit, floorName, mixer }: MixerValveProps) {
  const temperatures = `${formatTemperature(mixer?.temperature)} (${formatTemperature(mixer?.targetTemperature)})`
  return (
    <g role="img" aria-label={`Mieszacz ${circuit.mixerId} → ${floorName}: ${temperatures}`}>
      <g fill="#2a1a5a" stroke={circuit.color} strokeWidth={2} strokeLinejoin="round">
        <path d={`M ${x - 9} ${y - 17} L ${x + 9} ${y - 17} L ${x} ${y} Z`} />
        <path d={`M ${x - 9} ${y + 17} L ${x + 9} ${y + 17} L ${x} ${y} Z`} />
        <path d={`M ${x - 17} ${y - 9} L ${x - 17} ${y + 9} L ${x} ${y} Z`} />
        <line x1={x - 5} y1={y - 5} x2={x - 18} y2={y - 20} />
        <circle cx={x - 24} cy={y - 27} r={10} fill={circuit.color} stroke="#0f0826" />
      </g>
      <text className={styles.actuatorText} x={x - 24} y={y - 23} textAnchor="middle">
        M
      </text>
      <text className={styles.value} x={x + 18} y={y - 6}>
        M{circuit.mixerId} · {floorName}
      </text>
      <text className={styles.label} x={x + 18} y={y + 10}>
        {temperatures}
      </text>
      <text className={styles.label} x={x + 18} y={y + 26}>
        zawór {formatPercent(mixer?.valvePercent)} · {formatActuator(mixer?.actuator)}
      </text>
    </g>
  )
}
