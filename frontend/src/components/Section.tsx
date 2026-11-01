import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface SectionProps {
  title: string
  children: ReactNode
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>{children}</div>
    </section>
  )
}
