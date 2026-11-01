import { formatTemperature, formatTime } from '../format'
import styles from './StatusPill.module.css'

interface StatusPillProps {
  working: boolean
  updatedAt: number
  isError: boolean
  isFetching: boolean
  outdoorTemperature: number | null | undefined
  showBoiler?: boolean
}

export function StatusPill({ working, updatedAt, isError, isFetching, outdoorTemperature, showBoiler = true }: StatusPillProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.weather}>
        <span className={styles.weatherValue}>{formatTemperature(outdoorTemperature)}</span>
        <span className={styles.muted}>na zewnątrz</span>
      </div>
      {showBoiler && (
        <div className={isError ? `${styles.pill} ${styles.error}` : styles.pill}>
          <span className={styles.dot} aria-hidden="true" />
          {isError ? (
            <span role="alert">Brak połączenia z piecem</span>
          ) : (
            <span>{working ? 'Piec pracuje' : 'Piec w spoczynku'}</span>
          )}
          <span className={styles.muted}>
            {isFetching ? 'Odświeżanie…' : formatTime(updatedAt)}
          </span>
        </div>
      )}
    </div>
  )
}
