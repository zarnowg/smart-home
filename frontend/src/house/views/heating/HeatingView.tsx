import { useBoilerStatus, useMixers } from '../../../api/hooks'
import type { BoilerStatus, MixerStatus } from '../../../api/types'
import { formatPercent, formatTemperature } from '../../../format'
import { findMixer } from '../../heating'
import { HouseCards } from '../../HouseCards'
import { BASEMENT_ID, circuitForFloor, LIVING_FLOORS } from '../../houseConfig'
import type { Callout } from '../../scene/geometry'
import { HouseScene } from '../../scene/HouseScene'
import { BoilerUnit, CircuitTag, FlowPipe, MixingValve, ValveGauge, WaterTank } from './HeatingParts'
import {
  BOILER,
  FLAME_X,
  HOT_WATER_PIPE,
  MIXER_X,
  PIPE_PATHS,
  PORT_LENGTH,
  SUPPLY_PIPE,
  SUPPLY_Y,
  SUPPLY_Z,
  TANK,
} from './heatingGeometry'

function formatTarget(value: number | null | undefined): string | null {
  return value == null ? null : formatTemperature(value)
}

function withTarget(text: string, target: string | null): string {
  return target ? `${text}, zadana ${target}` : text
}

function buildCallouts(status: BoilerStatus | undefined, mixers: MixerStatus[] | undefined): Callout[] {
  const mixerCallouts = LIVING_FLOORS.flatMap((floor): Callout[] => {
    const circuit = circuitForFloor(floor.id)
    if (!circuit) {
      return []
    }
    const mixer = findMixer(mixers, circuit.mixerId)
    const temperature = formatTemperature(mixer?.temperature)
    const target = formatTarget(mixer?.targetTemperature)
    return [
      {
        id: floor.id,
        anchor: [MIXER_X[floor.id], SUPPLY_Y, SUPPLY_Z - PORT_LENGTH],
        row: 1,
        alignEnd: floor.id === 'parter',
        color: circuit.color,
        value: temperature,
        target,
        extra: <ValveGauge percent={mixer?.valvePercent} color={circuit.color} />,
        to: `/dom/${floor.id}`,
        ariaLabel: `${withTarget(`Mieszacz ${circuit.mixerId} → ${floor.name}: ${temperature}`, target)}, otwarcie zaworu ${formatPercent(mixer?.valvePercent)}`,
      },
    ]
  })
  const boilerTarget = formatTarget(status?.boilerTargetTemperature)
  const hotWaterTarget = formatTarget(status?.hotWaterTargetTemperature)
  return [
    ...mixerCallouts,
    {
      id: 'kociol',
      anchor: [FLAME_X, BOILER.y1, BOILER.z0],
      row: 0,
      alignEnd: true,
      value: formatTemperature(status?.boilerTemperature),
      target: boilerTarget,
      label: `Kocioł · ${formatPercent(status?.boilerPowerPercent)}`,
      to: `/dom/${BASEMENT_ID}`,
      ariaLabel: withTarget(`Kocioł: ${formatTemperature(status?.boilerTemperature)}`, boilerTarget),
    },
    {
      id: 'cwu',
      anchor: [TANK.x, TANK.y, TANK.top - 0.9],
      row: 0,
      alignEnd: false,
      value: formatTemperature(status?.hotWaterTemperature),
      target: hotWaterTarget,
      label: 'Ciepła woda',
      to: `/dom/${BASEMENT_ID}`,
      ariaLabel: withTarget(`Ciepła woda: ${formatTemperature(status?.hotWaterTemperature)}`, hotWaterTarget),
    },
  ]
}

function HeatingOverlay({ mixers }: { mixers: MixerStatus[] | undefined }) {
  return (
    <>
      {LIVING_FLOORS.map((floor) => {
        const circuit = circuitForFloor(floor.id)
        const mixer = circuit && findMixer(mixers, circuit.mixerId)
        const path = PIPE_PATHS[floor.id]
        return (
          <g key={floor.id}>
            <FlowPipe path={path} temperature={mixer?.temperature} flowing={Boolean(mixer?.pump)} />
            {circuit && <CircuitTag at={path[path.length - 1]} mixerId={circuit.mixerId} color={circuit.color} />}
          </g>
        )
      })}
      {LIVING_FLOORS.map((floor) => {
        const circuit = circuitForFloor(floor.id)
        if (!circuit) {
          return null
        }
        const mixer = findMixer(mixers, circuit.mixerId)
        return (
          <MixingValve
            key={floor.id}
            center={[MIXER_X[floor.id], SUPPLY_Y, SUPPLY_Z]}
            outlet={floor.id === 'parter' ? [0, PORT_LENGTH, 0] : [PORT_LENGTH, 0, 0]}
            color={circuit.color}
            valvePercent={mixer?.valvePercent}
            label={`Zawór mieszający M${circuit.mixerId}: ${formatPercent(mixer?.valvePercent)}`}
          />
        )
      })}
    </>
  )
}

export function HeatingView() {
  const status = useBoilerStatus().data
  const mixers = useMixers().data
  const warmFloors = LIVING_FLOORS.filter((floor) => {
    const circuit = circuitForFloor(floor.id)
    return Boolean(circuit && findMixer(mixers, circuit.mixerId)?.pump)
  }).map((floor) => floor.id)

  return (
    <>
      <HouseScene
        basement={
          <>
            <FlowPipe path={HOT_WATER_PIPE} temperature={status?.hotWaterTemperature} flowing={Boolean(status?.hotWaterPump)} />
            <BoilerUnit powerPercent={status?.boilerPowerPercent} />
            <WaterTank temperature={status?.hotWaterTemperature} />
            <FlowPipe path={SUPPLY_PIPE} temperature={status?.boilerTemperature} flowing={Boolean(status?.boilerPump)} />
          </>
        }
        overlay={<HeatingOverlay mixers={mixers} />}
        callouts={buildCallouts(status, mixers)}
        warmFloors={warmFloors}
        smoking={(status?.boilerPowerPercent ?? 0) > 0}
      />
      <HouseCards status={status} mixers={mixers} />
    </>
  )
}
