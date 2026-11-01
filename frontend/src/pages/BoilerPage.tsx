import { useBoilerStatus, useMixers } from '../api/hooks'
import type { BoilerStatus, MixerStatus } from '../api/types'
import { DeviceStateBadge } from '../components/DeviceStateBadge'
import { MixerCard } from '../components/MixerCard'
import { PercentBar } from '../components/PercentBar'
import { Section } from '../components/Section'
import { StatusBar } from '../components/StatusBar'
import { TemperatureTile } from '../components/TemperatureTile'
import styles from './BoilerPage.module.css'

function BoilerSections({ status }: { status: BoilerStatus }) {
  return (
    <>
      <Section title="Temperatury">
        <TemperatureTile label="Kocioł" value={status.boilerTemperature} />
        <TemperatureTile label="Ciepła woda (CWU)" value={status.hotWaterTemperature} />
        <TemperatureTile label="Bufor – góra" value={status.upperBufferTemperature} />
        <TemperatureTile label="Bufor – dół" value={status.lowerBufferTemperature} />
        <TemperatureTile label="Na zewnątrz" value={status.outdoorTemperature} />
        <TemperatureTile label="Spaliny" value={status.flueGasTemperature} />
        <TemperatureTile label="Podajnik" value={status.feederTemperature} />
      </Section>
      <Section title="Praca kotła">
        <PercentBar label="Moc kotła" value={status.boilerPowerPercent} />
        <PercentBar label="Tlen" value={status.oxygenPercent} />
        <PercentBar label="Poziom paliwa" value={status.fuelLevel} />
      </Section>
      <Section title="Urządzenia">
        <DeviceStateBadge label="Pompa CO" on={status.boilerPump} />
        <DeviceStateBadge label="Pompa CWU" on={status.hotWaterPump} />
        <DeviceStateBadge label="Dmuchawa" on={status.blower} />
        <DeviceStateBadge label="Podajnik" on={status.feeder} />
        <DeviceStateBadge label="Podajnik dodatkowy" on={status.additionalFeeder} />
        <DeviceStateBadge label="Zapalarka" on={status.igniter} />
        <DeviceStateBadge label="Termostat kotła" on={status.boilerThermostat} />
      </Section>
    </>
  )
}

function MixerSection({ mixers }: { mixers: MixerStatus[] }) {
  if (mixers.length === 0) {
    return null
  }
  return (
    <Section title="Mieszacze">
      {mixers.map((mixer) => (
        <MixerCard key={mixer.id} mixer={mixer} />
      ))}
    </Section>
  )
}

export function BoilerPage() {
  const status = useBoilerStatus()
  const mixers = useMixers()

  return (
    <div className={styles.page}>
      <StatusBar
        updatedAt={status.dataUpdatedAt}
        isError={status.isError || mixers.isError}
        isFetching={status.isFetching || mixers.isFetching}
      />
      {status.data ? (
        <BoilerSections status={status.data} />
      ) : (
        status.isPending && <p className={styles.message}>Ładowanie danych pieca…</p>
      )}
      {mixers.data && <MixerSection mixers={mixers.data} />}
    </div>
  )
}
