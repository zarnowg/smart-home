import { formatTime } from '../format'
import styles from './StatusBar.module.css'

interface StatusBarProps {
  updatedAt: number
  isError: boolean
  isFetching: boolean
}

export function StatusBar({ updatedAt, isError, isFetching }: StatusBarProps) {
  return (
    <div className={styles.status}>
      <span>Ostatnia aktualizacja: {formatTime(updatedAt)}</span>
      {isFetching && <span>Odświeżanie…</span>}
      {isError && (
        <span className={styles.error} role="alert">
          Brak połączenia z piecem
        </span>
      )}
    </div>
  )
}
