import { temperatureColor } from '../temperatureColor'
import styles from './BoilerSchematic.module.css'

interface PipeProps {
  points: Array<[number, number]>
  temperature: number | null | undefined
  flowing?: boolean
}

export function Pipe({ points, temperature, flowing }: PipeProps) {
  const path = points.map(([x, y]) => `${x},${y}`).join(' ')
  return (
    <g>
      <polyline className={styles.pipeBase} points={path} />
      <polyline className={styles.pipe} points={path} stroke={temperatureColor(temperature)} />
      {flowing && <polyline className={styles.flowing} points={path} />}
    </g>
  )
}
