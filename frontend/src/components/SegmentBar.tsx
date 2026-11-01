import styles from './SegmentBar.module.css'

interface SegmentBarProps {
  label: string
  value: number | null | undefined
  segments?: number
}

export function SegmentBar({ label, value, segments = 10 }: SegmentBarProps) {
  const percent = value == null ? 0 : Math.min(Math.max(value, 0), 100)
  const filled = Math.round((percent / 100) * segments)
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value ?? undefined}
    >
      {Array.from({ length: segments }, (_, i) => (
        <span key={i} className={i < filled ? `${styles.segment} ${styles.filled}` : styles.segment} />
      ))}
    </div>
  )
}
