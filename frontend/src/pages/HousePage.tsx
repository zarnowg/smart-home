import { useBoilerStatus, useMixers } from '../api/hooks'
import { StatusPill } from '../components/StatusPill'
import { HOUSE_VIEWS } from '../house/houseViews'
import { ViewSwitcher } from '../house/ViewSwitcher'
import styles from './HousePage.module.css'

export function HousePage({ viewId }: { viewId: string }) {
  const status = useBoilerStatus()
  const mixers = useMixers()
  const view = HOUSE_VIEWS.find((candidate) => candidate.id === viewId) ?? HOUSE_VIEWS[0]

  return (
    <div className={styles.page}>
      <StatusPill
        working={(status.data?.boilerPowerPercent ?? 0) > 0}
        updatedAt={status.dataUpdatedAt}
        isError={status.isError || mixers.isError}
        isFetching={status.isFetching || mixers.isFetching}
        outdoorTemperature={status.data?.outdoorTemperature}
        showBoiler={view.boilerInfo}
      />
      <ViewSwitcher activeId={view.id} />
      <view.Component />
    </div>
  )
}
