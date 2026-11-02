import { formatTemperature } from '../../format'
import { temperatureColor } from '../temperatureColor'
import styles from './BoilerSchematic.module.css'
import { HOT_WATER_TANK } from './layout'

interface HotWaterTankProps {
  temperature: number | null | undefined
}

export function HotWaterTank({ temperature }: HotWaterTankProps) {
  const { x, y, width, height } = HOT_WATER_TANK
  const center = x + width / 2
  return (
    <g role="img" aria-label={`Ciepła woda (CWU): ${formatTemperature(temperature)}`}>
      <rect x={x} y={y} width={width} height={height} rx={28} className={styles.node} style={{ fill: temperatureColor(temperature) }} stroke="#4d3d94" strokeWidth={4} />
      <text className={`${styles.label} ${styles.light}`} x={center} y={y + 50} textAnchor="middle">
        CWU
      </text>
      <text className={`${styles.value} ${styles.light}`} x={center} y={y + 75} textAnchor="middle">
        {formatTemperature(temperature)}
      </text>
    </g>
  )
}
