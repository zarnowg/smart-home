import { formatPercent, formatTemperature } from '../../format'
import { temperatureColor } from '../temperatureColor'
import styles from './BoilerSchematic.module.css'
import { BOILER } from './layout'
import { Flame } from './Flame'

interface BoilerProps {
  temperature: number | null | undefined
  flueGasTemperature: number | null | undefined
  oxygenPercent: number | null | undefined
  powerPercent: number | null | undefined
  igniter: boolean | null | undefined
}

export function Boiler({ temperature, flueGasTemperature, oxygenPercent, powerPercent, igniter }: BoilerProps) {
  const { x, y, width, height } = BOILER
  const center = x + width / 2
  return (
    <g>
      <rect x={x + width - 40} y={0} width={20} height={y} rx={4} fill="#3a2a78" />
      <text className={styles.label} x={x + width - 12} y={18}>
        Spaliny <tspan className={styles.value}>{formatTemperature(flueGasTemperature)}</tspan>
      </text>
      <text className={styles.label} x={x + width - 12} y={36}>
        Tlen <tspan className={styles.value}>{formatPercent(oxygenPercent)}</tspan>
      </text>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={22}
        className={styles.node}
      />
      <rect x={x + 20} y={y + 12} width={width - 40} height={4} rx={2} fill={temperatureColor(temperature)} />
      <text className={styles.label} x={center} y={y + 34} textAnchor="middle">
        KOCIOŁ
      </text>
      <text className={styles.big} x={center} y={y + 62} textAnchor="middle">
        {formatTemperature(temperature)}
      </text>
      <text className={styles.label} x={center} y={y + 84} textAnchor="middle">
        Moc {formatPercent(powerPercent)}
      </text>
      <rect x={x + 25} y={y + 100} width={width - 50} height={95} rx={16} fill="#0f0826" />
      <Flame x={center} baseY={y + 190} powerPercent={powerPercent} />
      <circle
        cx={x + 35}
        cy={y + 185}
        r={5}
        className={igniter ? styles.igniterOn : styles.igniterOff}
        role="img"
        aria-label={`Zapalarka: ${igniter ? 'włączona' : 'wyłączona'}`}
      />
    </g>
  )
}
