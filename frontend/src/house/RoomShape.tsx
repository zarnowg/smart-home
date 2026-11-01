import { formatTemperature } from '../format'
import styles from './House.module.css'

const GAP = 12

interface RoomShapeProps {
  name: string
  x: number
  y: number
  width: number
  height: number
  temperature: number | null | undefined
  staircase?: boolean
}

function Steps({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  const count = 6
  const step = (height - 40) / (count + 1)
  return (
    <g className={styles.steps}>
      {Array.from({ length: count }, (_, i) => (
        <line key={i} x1={x + 24} x2={x + width - 24} y1={y + 40 + step * (i + 1)} y2={y + 40 + step * (i + 1)} />
      ))}
    </g>
  )
}

export function RoomShape({ name, x, y, width, height, temperature, staircase }: RoomShapeProps) {
  const center = x + width / 2
  const gap = GAP / 2
  return (
    <g role="group" aria-label={name}>
      <rect
        className={staircase ? `${styles.room} ${styles.staircase}` : styles.room}
        x={x + gap}
        y={y + gap}
        width={width - GAP}
        height={height - GAP}
        rx={20}
      />
      {staircase && <Steps x={x} y={y} width={width} height={height} />}
      <text className={staircase ? `${styles.roomName} ${styles.halo}` : styles.roomName} x={center} y={y + 36} textAnchor="middle">
        {name}
      </text>
      <text className={staircase ? `${styles.roomTemperature} ${styles.halo}` : styles.roomTemperature} x={center} y={y + height / 2 + 14} textAnchor="middle">
        {formatTemperature(temperature)}
      </text>
    </g>
  )
}
