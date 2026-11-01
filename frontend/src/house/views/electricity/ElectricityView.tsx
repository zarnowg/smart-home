import { HouseScene } from '../../scene/HouseScene'
import { BoltIcon } from '../ViewIcons'
import styles from './ElectricityView.module.css'

export function ElectricityView() {
  return (
    <>
      <HouseScene />
      <section className={styles.empty} aria-label="Elektryczność">
        <span className={styles.icon}>
          <BoltIcon />
        </span>
        <div>
          <p className={styles.title}>Dane o prądzie pojawią się wkrótce</p>
          <p className={styles.text}>Tu zobaczysz pobór z sieci, rozdzielnicę i zużycie na każdym piętrze.</p>
        </div>
      </section>
    </>
  )
}
