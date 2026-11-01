import { formatPercent } from '../format'
import styles from './PercentBar.module.css'

interface PercentBarProps {
  label: string
  value: number | null
}

export function PercentBar({ label, value }: PercentBarProps) {
  const width = value == null ? 0 : Math.min(Math.max(value, 0), 100)
  return (
    <div className={styles.bar}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{formatPercent(value)}</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value ?? undefined}
      >
        <div className={styles.fill} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}
