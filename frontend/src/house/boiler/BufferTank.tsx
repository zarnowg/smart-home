import { useId } from 'react'
import { formatTemperature } from '../../format'
import { temperatureColor } from '../temperatureColor'
import styles from './BoilerSchematic.module.css'
import { BUFFER } from './layout'

interface BufferTankProps {
  upperTemperature: number | null | undefined
  lowerTemperature: number | null | undefined
}

export function BufferTank({ upperTemperature, lowerTemperature }: BufferTankProps) {
  const gradientId = `buffer-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { x, y, width, height } = BUFFER
  const center = x + width / 2
  const upper = formatTemperature(upperTemperature)
  const lower = formatTemperature(lowerTemperature)
  return (
    <g role="img" aria-label={`Bufor: góra ${upper}, dół ${lower}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={temperatureColor(upperTemperature)} />
          <stop offset="1" stopColor={temperatureColor(lowerTemperature)} />
        </linearGradient>
      </defs>
      <text className={styles.label} x={center} y={y - 10} textAnchor="middle">
        Bufor
      </text>
      <rect x={x} y={y} width={width} height={height} rx={36} fill={`url(#${gradientId})`} stroke="#ffffff" strokeWidth={4} className={styles.node} style={{ fill: `url(#${gradientId})` }} />
      <text className={`${styles.value} ${styles.light}`} x={center} y={y + 40} textAnchor="middle">
        {upper}
      </text>
      <text className={`${styles.value} ${styles.light}`} x={center} y={y + height - 28} textAnchor="middle">
        {lower}
      </text>
    </g>
  )
}
