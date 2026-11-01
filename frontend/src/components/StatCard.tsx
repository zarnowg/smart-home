import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styles from './StatCard.module.css'

interface StatCardProps {
  title: string
  value?: string
  unit?: string
  to?: string
  wide?: boolean
  children?: ReactNode
}

export function StatCard({ title, value, unit, to, wide, children }: StatCardProps) {
  return (
    <article className={wide ? `${styles.card} ${styles.wide}` : styles.card} aria-label={title}>
      {to && (
        <Link className={styles.arrow} to={to} aria-label={`${title} – szczegóły`}>
          ↗
        </Link>
      )}
      {value != null && (
        <div className={styles.value}>
          {value}
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>
      )}
      {wide && <h3 className={styles.title}>{title}</h3>}
      {children && <div className={styles.details}>{children}</div>}
      {!wide && <h3 className={styles.title}>{title}</h3>}
    </article>
  )
}
