import { formatTemperature } from '../format'
import styles from './TemperatureTile.module.css'

interface TemperatureTileProps {
  label: string
  value: number | null
}

export function TemperatureTile({ label, value }: TemperatureTileProps) {
  return (
    <div className={styles.tile}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{formatTemperature(value)}</span>
    </div>
  )
}
