import { formatOnOff } from '../format'
import styles from './DeviceStateBadge.module.css'

interface DeviceStateBadgeProps {
  label: string
  on: boolean | null
}

export function DeviceStateBadge({ label, on }: DeviceStateBadgeProps) {
  return (
    <div className={on ? `${styles.badge} ${styles.on}` : styles.badge}>
      <span className={styles.dot} aria-hidden="true" />
      <span>{label}</span>
      <span className={styles.state}>{formatOnOff(on)}</span>
    </div>
  )
}
