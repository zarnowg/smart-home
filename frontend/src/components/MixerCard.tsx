import type { MixerStatus } from '../api/types'
import { formatActuator, formatOnOff, formatPercent, formatTemperature } from '../format'
import styles from './MixerCard.module.css'

interface MixerCardProps {
  mixer: MixerStatus
}

export function MixerCard({ mixer }: MixerCardProps) {
  return (
    <article className={styles.mixer} aria-label={`Mieszacz ${mixer.id}`}>
      <h3 className={styles.name}>Mieszacz {mixer.id}</h3>
      <div className={styles.temperatures}>
        {formatTemperature(mixer.temperature)}{' '}
        <span className={styles.target}>zadana {formatTemperature(mixer.targetTemperature)}</span>
      </div>
      <dl>
        <div className={styles.row}>
          <dt>Pompa</dt>
          <dd>{formatOnOff(mixer.pump)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Termostat pokojowy</dt>
          <dd>{formatOnOff(mixer.roomThermostat)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Zawór</dt>
          <dd>{formatPercent(mixer.valvePercent)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Siłownik</dt>
          <dd>{formatActuator(mixer.actuator)}</dd>
        </div>
      </dl>
    </article>
  )
}
