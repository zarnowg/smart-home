import { useBoilerStatus, useMixers } from '../api/hooks'
import { StatusPill } from '../components/StatusPill'
import { HouseCards } from '../house/HouseCards'
import { HouseIllustration } from '../house/HouseIllustration'
import styles from './HousePage.module.css'

export function HousePage() {
  const status = useBoilerStatus()
  const mixers = useMixers()

  return (
    <div className={styles.page}>
      <StatusPill
        working={(status.data?.boilerPowerPercent ?? 0) > 0}
        updatedAt={status.dataUpdatedAt}
        isError={status.isError || mixers.isError}
        isFetching={status.isFetching || mixers.isFetching}
        outdoorTemperature={status.data?.outdoorTemperature}
      />
      <HouseIllustration status={status.data} mixers={mixers.data} />
      <HouseCards status={status.data} mixers={mixers.data} />
    </div>
  )
}
