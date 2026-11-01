import { Link, Navigate, useParams } from 'react-router-dom'
import { useBoilerStatus, useMixers } from '../api/hooks'
import { StatusPill } from '../components/StatusPill'
import { BoilerSchematic } from '../house/boiler/BoilerSchematic'
import { FloorView } from '../house/FloorView'
import { circuitSummary, findMixer } from '../house/heating'
import { BASEMENT_ID, circuitForFloor, findFloor } from '../house/houseConfig'
import houseStyles from '../house/House.module.css'
import styles from './HousePage.module.css'

export function FloorPage() {
  const { floorId } = useParams()
  const status = useBoilerStatus()
  const mixers = useMixers()
  const floor = findFloor(floorId)
  const isBasement = floorId === BASEMENT_ID

  if (!floor && !isBasement) {
    return <Navigate to="/dom" replace />
  }
  const circuit = floor && circuitForFloor(floor.id)

  return (
    <div className={styles.page}>
      <StatusPill
        working={(status.data?.boilerPowerPercent ?? 0) > 0}
        updatedAt={status.dataUpdatedAt}
        isError={status.isError || mixers.isError}
        isFetching={status.isFetching || mixers.isFetching}
        outdoorTemperature={status.data?.outdoorTemperature}
      />
      <div className={styles.heading}>
        <Link className={styles.back} to="/dom" aria-label="Wróć do domu">
          ←
        </Link>
        <div>
          <h2 className={styles.title}>{floor ? floor.name : 'Piwnica'}</h2>
          {circuit && (
            <p className={styles.subtitle}>{circuitSummary(circuit, findMixer(mixers.data, circuit.mixerId))}</p>
          )}
        </div>
        {isBasement && (
          <Link className={styles.details} to="/piec">
            Szczegóły pieca ↗
          </Link>
        )}
      </div>
      {floor ? (
        <FloorView floor={floor} />
      ) : (
        <div className={`${houseStyles.drawing} ${houseStyles.scroll}`}>
          <BoilerSchematic status={status.data} mixers={mixers.data} />
        </div>
      )}
    </div>
  )
}
