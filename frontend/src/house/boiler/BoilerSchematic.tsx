import type { BoilerStatus, MixerStatus } from '../../api/types'
import { findMixer } from '../heating'
import { HEATING_CIRCUITS, LIVING_FLOORS, RISER_X } from '../houseConfig'
import { Boiler } from './Boiler'
import { BufferTank } from './BufferTank'
import { Device } from './Device'
import { FuelHopper } from './FuelHopper'
import { HotWaterTank } from './HotWaterTank'
import { BOILER, BUFFER, HOPPER, HOT_WATER_TANK, SCHEMATIC_HEIGHT, SCHEMATIC_WIDTH } from './layout'
import { MixerValve } from './MixerValve'
import { Pipe } from './Pipe'

const HEADER_Y = 90
const SUPPLY_Y = 110
const RETURN_Y = 260
const CIRCUIT_LAYOUT = [
  { x: 680, outY: 305 },
  { x: 840, outY: 280 },
]

interface BoilerSchematicProps {
  status: BoilerStatus | undefined
  mixers: MixerStatus[] | undefined
}

export function BoilerSchematic({ status, mixers }: BoilerSchematicProps) {
  const boilerRight = BOILER.x + BOILER.width
  const bufferRight = BUFFER.x + BUFFER.width
  const hotWaterX = HOT_WATER_TANK.x + HOT_WATER_TANK.width / 2
  const lastCircuitX = CIRCUIT_LAYOUT[Math.min(HEATING_CIRCUITS.length, CIRCUIT_LAYOUT.length) - 1]?.x ?? hotWaterX
  const feederX = (HOPPER.x + HOPPER.width + BOILER.x) / 2
  const supplyTemperature = status?.upperBufferTemperature ?? status?.boilerTemperature

  return (
    <svg
      viewBox={`0 0 ${SCHEMATIC_WIDTH} ${SCHEMATIC_HEIGHT}`}
      role="group"
      aria-label="Schemat instalacji grzewczej"
    >
      <rect x={HOPPER.x + HOPPER.width} y={232} width={BOILER.x - HOPPER.x - HOPPER.width} height={16} rx={8} fill="#dfe5f3" />
      <FuelHopper levelPercent={status?.fuelLevel} />
      <Device x={feederX} y={240} label="Podajnik" on={status?.feeder} kind="auger" />
      <Device x={feederX} y={175} label="Dmuchawa" on={status?.blower} kind="fan" labelPosition="above" />
      <Boiler
        temperature={status?.boilerTemperature}
        flueGasTemperature={status?.flueGasTemperature}
        oxygenPercent={status?.oxygenPercent}
        powerPercent={status?.boilerPowerPercent}
        igniter={status?.igniter}
      />

      <Pipe points={[[boilerRight, SUPPLY_Y], [BUFFER.x, SUPPLY_Y]]} temperature={status?.boilerTemperature} flowing={Boolean(status?.boilerPump)} />
      <Pipe points={[[BUFFER.x, RETURN_Y], [boilerRight, RETURN_Y]]} temperature={status?.lowerBufferTemperature} flowing={Boolean(status?.boilerPump)} />
      <Device x={(boilerRight + BUFFER.x) / 2} y={SUPPLY_Y} label="Pompa CO" on={status?.boilerPump} labelPosition="above" />
      <BufferTank upperTemperature={status?.upperBufferTemperature} lowerTemperature={status?.lowerBufferTemperature} />

      <Pipe points={[[bufferRight, HEADER_Y], [lastCircuitX, HEADER_Y]]} temperature={supplyTemperature} />
      <Pipe points={[[hotWaterX, HEADER_Y], [hotWaterX, HOT_WATER_TANK.y]]} temperature={supplyTemperature} flowing={Boolean(status?.hotWaterPump)} />
      <Device x={hotWaterX} y={HEADER_Y + 30} label="Pompa CWU" on={status?.hotWaterPump} labelPosition="left" />
      <HotWaterTank temperature={status?.hotWaterTemperature} />

      {HEATING_CIRCUITS.slice(0, CIRCUIT_LAYOUT.length).map((circuit, index) => {
        const { x, outY } = CIRCUIT_LAYOUT[index]
        const mixer = findMixer(mixers, circuit.mixerId)
        const riserX = RISER_X[circuit.floorId]
        const floorName = LIVING_FLOORS.find((floor) => floor.id === circuit.floorId)?.name ?? circuit.floorId
        return (
          <g key={circuit.mixerId}>
            <Pipe points={[[x, HEADER_Y], [x, 150]]} temperature={supplyTemperature} />
            <Pipe points={[[x, 150], [x, outY], [riserX, outY], [riserX, 0]]} temperature={mixer?.temperature} flowing={Boolean(mixer?.pump)} />
            <MixerValve x={x} y={150} circuit={circuit} floorName={floorName} mixer={mixer} />
            <Device
              x={x}
              y={225}
              label="Pompa"
              name={`Pompa M${circuit.mixerId}`}
              on={mixer?.pump}
              labelPosition="right"
            />
          </g>
        )
      })}
    </svg>
  )
}
