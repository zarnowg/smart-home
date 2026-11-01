import { formatPercent } from '../../format'
import styles from './BoilerSchematic.module.css'
import { HOPPER } from './layout'

interface FuelHopperProps {
  levelPercent: number | null | undefined
}

export function FuelHopper({ levelPercent }: FuelHopperProps) {
  const { x, y, width, height } = HOPPER
  const level = levelPercent == null ? 0 : Math.min(Math.max(levelPercent, 0), 100)
  return (
    <g role="img" aria-label={`Zasobnik paliwa: ${formatPercent(levelPercent)}`}>
      <text className={styles.label} x={x + width / 2} y={y - 10} textAnchor="middle">
        Paliwo
      </text>
      <rect x={x} y={y} width={width} height={height} rx={18} className={styles.node} />
      <rect x={x + 8} y={y + 8 + (height - 16) * (1 - level / 100)} width={width - 16} height={((height - 16) * level) / 100} rx={10} fill="#d8b48c" />
      <text className={styles.value} x={x + width / 2} y={y + height + 20} textAnchor="middle">
        {formatPercent(levelPercent)}
      </text>
    </g>
  )
}
