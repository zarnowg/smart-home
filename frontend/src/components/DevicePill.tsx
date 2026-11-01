import { formatOnOff } from '../format'
import styles from './DevicePill.module.css'

interface DevicePillProps {
  label: string
  on: boolean | null | undefined
}

export function DevicePill({ label, on }: DevicePillProps) {
  return (
    <span className={on ? `${styles.pill} ${styles.on}` : styles.pill}>
      <span className={styles.dot} aria-hidden="true" />
      {label}: {formatOnOff(on)}
    </span>
  )
}
