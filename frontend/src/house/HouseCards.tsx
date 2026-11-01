import type { BoilerStatus, MixerStatus } from '../api/types'
import { DevicePill } from '../components/DevicePill'
import { SegmentBar } from '../components/SegmentBar'
import { StatCard } from '../components/StatCard'
import { EMPTY, formatNumber, formatOnOff, formatPercent, formatTemperature } from '../format'
import { findMixer } from './heating'
import styles from './HouseCards.module.css'
import { BASEMENT_ID, HEATING_CIRCUITS, LIVING_FLOORS } from './houseConfig'

interface HouseCardsProps {
  status: BoilerStatus | undefined
  mixers: MixerStatus[] | undefined
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <span className={styles.strong}>{value}</span>
    </div>
  )
}

export function HouseCards({ status, mixers }: HouseCardsProps) {
  const hasBuffer = status?.upperBufferTemperature != null || status?.lowerBufferTemperature != null
  return (
    <section className={styles.grid} aria-label="Parametry">
      <StatCard title="Kocioł" value={formatNumber(status?.boilerTemperature)} unit="°C" to="/piec">
        <Row label="Moc" value={formatPercent(status?.boilerPowerPercent)} />
        <SegmentBar label="Moc kotła" value={status?.boilerPowerPercent} />
      </StatCard>
      <StatCard title="Ciepła woda" value={formatNumber(status?.hotWaterTemperature)} unit="°C" to={`/dom/${BASEMENT_ID}`}>
        <Row label="Pompa CWU" value={formatOnOff(status?.hotWaterPump)} />
      </StatCard>
      <StatCard title="Paliwo" value={formatNumber(status?.fuelLevel)} unit="%">
        <SegmentBar label="Poziom paliwa" value={status?.fuelLevel} />
      </StatCard>
      <StatCard title="Spaliny" value={formatNumber(status?.flueGasTemperature)} unit="°C">
        <Row label="Tlen" value={formatPercent(status?.oxygenPercent)} />
      </StatCard>
      {HEATING_CIRCUITS.map((circuit) => {
        const mixer = findMixer(mixers, circuit.mixerId)
        const floor = LIVING_FLOORS.find((item) => item.id === circuit.floorId)
        return (
          <StatCard
            key={circuit.mixerId}
            title={`${floor?.name ?? EMPTY} · ${circuit.name}`}
            value={formatNumber(mixer?.temperature)}
            unit="°C"
            to={`/dom/${circuit.floorId}`}
          >
            <Row label="Zadana" value={formatTemperature(mixer?.targetTemperature)} />
            <Row label="Zawór" value={formatPercent(mixer?.valvePercent)} />
            <SegmentBar label={`Zawór M${circuit.mixerId}`} value={mixer?.valvePercent} />
          </StatCard>
        )
      })}
      {hasBuffer && (
        <StatCard title="Bufor">
          <Row label="Góra" value={formatTemperature(status?.upperBufferTemperature)} />
          <Row label="Dół" value={formatTemperature(status?.lowerBufferTemperature)} />
        </StatCard>
      )}
      <StatCard title="Urządzenia" wide>
        <div className={styles.pills}>
          <DevicePill label="Pompa CO" on={status?.boilerPump} />
          <DevicePill label="Pompa CWU" on={status?.hotWaterPump} />
          {HEATING_CIRCUITS.map((circuit) => (
            <DevicePill key={circuit.mixerId} label={`Pompa M${circuit.mixerId}`} on={findMixer(mixers, circuit.mixerId)?.pump} />
          ))}
          <DevicePill label="Dmuchawa" on={status?.blower} />
          <DevicePill label="Podajnik" on={status?.feeder} />
          <DevicePill label="Zapalarka" on={status?.igniter} />
        </div>
      </StatCard>
    </section>
  )
}
