import { useId, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { BoilerStatus, MixerStatus } from '../api/types'
import { formatPercent, formatTemperature } from '../format'
import { findMixer } from './heating'
import styles from './HouseIllustration.module.css'
import { BASEMENT_ID, circuitForFloor, LIVING_FLOORS, type LivingFloorId } from './houseConfig'
import { createIso, type Vec3 } from './iso'
import { temperatureColor } from './temperatureColor'

const VIEW_WIDTH = 720
const VIEW_HEIGHT = 725
const ROW_Y = [560, 635]
const LABEL_HEIGHT = 50

const W = 10
const D = 7
const FLOOR = 3
const WALL = 6
const BASE = -3
const RIDGE = 8.8
const EAVE = 5.7
const OVERHANG = 0.4
const PLATE = 2

const SCALE = 24
const iso = createIso(329, 262, SCALE)

const FLOOR_INDEX: Record<LivingFloorId, number> = { parter: 0, pietro: 1 }

const SUPPLY_Y = 6
const SUPPLY_Z = -2.45
const ACTUATOR = { half: 0.34, bottom: 0.62, top: 1.08 }
const PORT_LENGTH = 0.55

const MIXER_X: Record<LivingFloorId, number> = { parter: 6.2, pietro: 9 }

const BOILER = { x0: 0.4, x1: 2.2, y0: D - 1.4, y1: D - 0.2, z0: BASE, z1: -1.5 }
const FLAME_X = 1.3
const FLAME_BASE = -2.68

const SUPPLY_PIPE: Vec3[] = [
  [BOILER.x1, SUPPLY_Y, SUPPLY_Z],
  [MIXER_X.pietro, SUPPLY_Y, SUPPLY_Z],
]

const PIPE_PATHS: Record<LivingFloorId, Vec3[]> = {
  pietro: [
    [MIXER_X.pietro, SUPPLY_Y, SUPPLY_Z],
    [W, SUPPLY_Y, SUPPLY_Z],
    [W, SUPPLY_Y, 3.5],
    [W, 2.5, 3.5],
  ],
  parter: [
    [MIXER_X.parter, SUPPLY_Y, SUPPLY_Z],
    [MIXER_X.parter, D, SUPPLY_Z],
    [MIXER_X.parter, D, 0.5],
    [3.5, D, 0.5],
  ],
}

const TANK = { x: 9.3, y: 1.6, radius: 0.55, bottom: BASE, top: -1.45 }
const ISO_ELLIPSE_X = Math.sqrt(1.5)
const ISO_ELLIPSE_Y = Math.SQRT1_2

const HOT_WATER_PIPE: Vec3[] = [
  [BOILER.x1, 5.75, -2],
  [2.8, 5.75, -2],
  [2.8, 1.6, -2],
  [TANK.x - TANK.radius, TANK.y, -2],
]

interface HouseIllustrationProps {
  status: BoilerStatus | undefined
  mixers: MixerStatus[] | undefined
}

interface Callout {
  id: string
  anchor: Vec3
  row: 0 | 1
  alignEnd: boolean
  color?: string
  value: string
  target: string | null
  valvePercent?: number | null
  label?: string
  to: string
  ariaLabel: string
}

type BoxProps = Record<'x0' | 'x1' | 'y0' | 'y1' | 'z0' | 'z1', number> & { topFill?: string }

function Box({ x0, x1, y0, y1, z0, z1, topFill }: BoxProps) {
  return (
    <g>
      <polygon className={styles.boxLeft} points={iso.points([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1])} />
      <polygon className={styles.boxRight} points={iso.points([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1])} />
      <polygon
        className={styles.boxTop}
        style={topFill ? { fill: topFill } : undefined}
        points={iso.points([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1])}
      />
    </g>
  )
}

function boilerFace(x: number, z: number) {
  return iso.project([x, BOILER.y1, z])
}

function facePolygon(x0: number, x1: number, z0: number, z1: number) {
  return iso.points([x0, BOILER.y1, z0], [x1, BOILER.y1, z0], [x1, BOILER.y1, z1], [x0, BOILER.y1, z1])
}

function flamePath(halfWidth: number, height: number) {
  const left = boilerFace(FLAME_X - halfWidth, FLAME_BASE)
  const leftControl = boilerFace(FLAME_X - halfWidth, FLAME_BASE + height * 0.65)
  const tip = boilerFace(FLAME_X, FLAME_BASE + height)
  const rightControl = boilerFace(FLAME_X + halfWidth, FLAME_BASE + height * 0.65)
  const right = boilerFace(FLAME_X + halfWidth, FLAME_BASE)
  return `M ${left.x} ${left.y} Q ${leftControl.x} ${leftControl.y} ${tip.x} ${tip.y} Q ${rightControl.x} ${rightControl.y} ${right.x} ${right.y} Z`
}

function BoilerUnit({ powerPercent }: { powerPercent: number | null | undefined }) {
  const power = Math.min(Math.max(powerPercent ?? 0, 0), 100)
  const burning = power > 0
  const height = 0.3 + (power / 100) * 0.45
  const knob = boilerFace(1.78, -1.74)
  return (
    <g role="img" aria-label={burning ? 'Kocioł pracuje' : 'Kocioł w spoczynku'}>
      <Box {...BOILER} />
      <Box x0={0.95} x1={1.35} y0={BOILER.y0 + 0.35} y1={BOILER.y0 + 0.75} z0={BOILER.z1} z1={BOILER.z1 + 0.35} />
      <polygon className={styles.boilerWindow} points={facePolygon(0.7, 1.9, -2.78, -1.98)} />
      <polygon className={burning ? styles.boilerDisplayOn : styles.boilerDisplay} points={facePolygon(0.7, 1.5, -1.84, -1.66)} />
      <circle className={styles.boilerKnob} cx={knob.x} cy={knob.y} r={2.6} />
      {burning ? (
        <g className={styles.flameGlow}>
          <path className={styles.flameOuter} d={flamePath(0.3, height)} />
          <path className={styles.flameInner} d={flamePath(0.15, height * 0.55)} />
        </g>
      ) : (
        <path className={styles.flameOff} d={flamePath(0.2, 0.2)} />
      )}
    </g>
  )
}

function WaterTank({ temperature }: { temperature: number | null | undefined }) {
  const gradientId = `tank-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const radius = TANK.radius * SCALE
  const rx = radius * ISO_ELLIPSE_X
  const ry = radius * ISO_ELLIPSE_Y
  const top = iso.project([TANK.x, TANK.y, TANK.top])
  const bottom = iso.project([TANK.x, TANK.y, TANK.bottom])
  const band = iso.project([TANK.x, TANK.y, TANK.top - 0.35])
  const outlet = iso.project([TANK.x, TANK.y, TANK.top + 0.55])
  const color = temperatureColor(temperature)
  const frontArc = (y: number) => `M ${top.x - rx} ${y} A ${rx} ${ry} 0 0 0 ${top.x + rx} ${y}`
  return (
    <g role="img" aria-label={`Zasobnik CWU: ${formatTemperature(temperature)}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#f4f6fc" />
          <stop offset="1" stopColor="#d5dcee" />
        </linearGradient>
      </defs>
      <path
        className={styles.tankBody}
        fill={`url(#${gradientId})`}
        d={`M ${top.x - rx} ${top.y} L ${bottom.x - rx} ${bottom.y} A ${rx} ${ry} 0 0 0 ${bottom.x + rx} ${bottom.y} L ${top.x + rx} ${top.y} Z`}
      />
      <path className={styles.tankBand} d={frontArc(band.y)} stroke={color} />
      <path className={styles.tankBand} d={frontArc(bottom.y - 6)} stroke={color} opacity={0.35} />
      <path
        className={styles.tankTop}
        d={`M ${top.x - rx} ${top.y} A ${rx} ${ry * 1.4} 0 0 1 ${top.x + rx} ${top.y} A ${rx} ${ry} 0 0 1 ${top.x - rx} ${top.y} Z`}
      />
      <line className={styles.tankOutlet} x1={top.x} x2={outlet.x} y1={top.y - ry * 0.6} y2={outlet.y} />
          </g>
  )
}

interface MixingValveProps {
  center: Vec3
  outlet: Vec3
  color: string
  valvePercent: number | null | undefined
  label: string
}

function MixingValve({ center, outlet, color, valvePercent, label }: MixingValveProps) {
  const [x, y, z] = center
  const c = iso.project(center)
  const ports: Vec3[] = [[-PORT_LENGTH, 0, 0], outlet, [0, 0, -PORT_LENGTH]]
  const angle = (((valvePercent ?? 0) / 100) * Math.PI) / 2
  const topZ = z + ACTUATOR.top
  const handleEnd = iso.project([x + Math.cos(angle) * 0.28, y + Math.sin(angle) * 0.28, topZ])
  const handleStart = iso.project([x, y, topZ])
  const neckTop = iso.project([x, y, z + ACTUATOR.bottom])
  return (
    <g role="img" aria-label={label}>
      {ports.map(([dx, dy, dz]) => {
        const end = iso.project([x + dx, y + dy, z + dz])
        return (
          <g key={`${dx},${dy},${dz}`}>
            <line className={styles.valvePortOuter} x1={c.x} y1={c.y} x2={end.x} y2={end.y} />
            <line className={styles.valvePort} x1={c.x} y1={c.y} x2={end.x} y2={end.y} />
            <circle className={styles.valveFlange} cx={end.x} cy={end.y} r={5} />
          </g>
        )
      })}
      <line className={styles.valveNeck} x1={c.x} y1={c.y} x2={neckTop.x} y2={neckTop.y} />
      <circle className={styles.valveBody} cx={c.x} cy={c.y} r={10} />
      <Box
        x0={x - ACTUATOR.half}
        x1={x + ACTUATOR.half}
        y0={y - ACTUATOR.half}
        y1={y + ACTUATOR.half}
        z0={z + ACTUATOR.bottom}
        z1={topZ}
        topFill={color}
      />
      <line className={styles.valveHandle} x1={handleStart.x} y1={handleStart.y} x2={handleEnd.x} y2={handleEnd.y} />
    </g>
  )
}

function CircuitTag({ at, mixerId, color }: { at: Vec3; mixerId: number; color: string }) {
  const { x, y } = iso.project(at)
  return (
    <g aria-hidden="true">
      <rect x={x - 16} y={y - 10} width={32} height={20} rx={10} fill={color} stroke="#ffffff" strokeWidth={2} />
      <text className={styles.tagText} x={x} y={y + 4} textAnchor="middle">
        M{mixerId}
      </text>
    </g>
  )
}

function FlowPipe({ path, temperature, flowing }: { path: Vec3[]; temperature: number | null | undefined; flowing: boolean }) {
  const points = iso.points(...path)
  return (
    <g>
      <polyline className={styles.pipeBase} points={points} />
      <polyline
        className={flowing ? `${styles.pipe} ${styles.flowing}` : styles.pipe}
        points={points}
        stroke={temperatureColor(temperature)}
      />
    </g>
  )
}

function Window({ wall, from, to, z0, z1, warm }: { wall: 'left' | 'right'; from: number; to: number; z0: number; z1: number; warm: boolean }) {
  const vertices: Vec3[] =
    wall === 'left'
      ? [[from, D, z0], [to, D, z0], [to, D, z1], [from, D, z1]]
      : [[W, from, z0], [W, to, z0], [W, to, z1], [W, from, z1]]
  return <polygon className={warm ? styles.windowWarm : styles.window} points={iso.points(...vertices)} />
}

function FloorWindows({ floorIndex, warm }: { floorIndex: number; warm: boolean }) {
  const z0 = floorIndex * FLOOR + 1
  const z1 = z0 + 1.3
  const leftWindows = floorIndex === 0 ? [[1, 2.6], [3.6, 5.2]] : [[1, 2.6], [3.6, 5.2], [6.6, 8.2]]
  return (
    <g>
      {leftWindows.map(([from, to]) => (
        <Window key={from} wall="left" from={from} to={to} z0={z0} z1={z1} warm={warm} />
      ))}
      {[[0.8, 2.2], [3.2, 4.6]].map(([from, to]) => (
        <Window key={from} wall="right" from={from} to={to} z0={z0} z1={z1} warm={warm} />
      ))}
    </g>
  )
}

function FloorHitArea({ floorId, name }: { floorId: string; name: string }) {
  const navigate = useNavigate()
  const index = floorId === BASEMENT_ID ? -1 : FLOOR_INDEX[floorId as LivingFloorId]
  const z0 = index * FLOOR
  const z1 = z0 + FLOOR
  const open = () => navigate(`/dom/${floorId}`)
  return (
    <g
      className={styles.floorLink}
      role="link"
      tabIndex={0}
      aria-label={`${name} – ${floorId === BASEMENT_ID ? 'pokaż schemat' : 'pokaż plan'}`}
      onClick={open}
      onKeyDown={(event: KeyboardEvent) => event.key === 'Enter' && open()}
    >
      <polygon points={iso.points([0, D, z0], [W, D, z0], [W, D, z1], [0, D, z1])} />
      <polygon points={iso.points([W, 0, z0], [W, D, z0], [W, D, z1], [W, 0, z1])} />
    </g>
  )
}

const GAUGE_PIVOT = { x: 2, y: 20 }
const GAUGE_RADIUS = 17

function gaugePoint(percent: number) {
  const angle = (Math.min(Math.max(percent, 0), 100) / 100) * (Math.PI / 2)
  return {
    x: GAUGE_PIVOT.x + GAUGE_RADIUS * Math.cos(angle),
    y: GAUGE_PIVOT.y - GAUGE_RADIUS * Math.sin(angle),
  }
}

function ValveGauge({ percent, color }: { percent: number | null | undefined; color?: string }) {
  const { x: px, y: py } = GAUGE_PIVOT
  const start = gaugePoint(0)
  const full = gaugePoint(100)
  const needle = percent == null ? null : gaugePoint(percent)
  return (
    <span className={styles.gauge}>
      <svg className={styles.gaugeIcon} viewBox="0 0 22 22" aria-hidden="true">
        <path className={styles.gaugeTrack} d={`M ${px} ${py} L ${start.x} ${start.y} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 0 0 ${full.x} ${full.y} Z`} />
        {needle && (
          <>
            <path
              d={`M ${px} ${py} L ${start.x} ${start.y} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 0 0 ${needle.x} ${needle.y} Z`}
              fill={color}
              fillOpacity={0.45}
            />
            <line className={styles.gaugeNeedle} x1={px} y1={py} x2={needle.x} y2={needle.y} stroke={color} />
            <circle cx={px} cy={py} r={2} fill={color} />
          </>
        )}
      </svg>
      <span>
        otwarcie <strong className={styles.gaugeValue}>{formatPercent(percent)}</strong>
      </span>
    </span>
  )
}

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
        valvePercent: mixer?.valvePercent,
        to: `/dom/${floor.id}`,
        ariaLabel: `${withTarget(`Mieszacz ${circuit.mixerId} → ${floor.name}: ${temperature}`, target)}, otwarcie zaworu ${formatPercent(mixer?.valvePercent)}`,
      },
    ]
  })
  return [
    ...mixerCallouts,
    {
      id: 'kociol',
      anchor: [FLAME_X, BOILER.y1, BOILER.z0],
      row: 0,
      alignEnd: true,
      value: formatTemperature(status?.boilerTemperature),
      target: formatTarget(status?.boilerTargetTemperature),
      label: `Kocioł · ${formatPercent(status?.boilerPowerPercent)}`,
      to: `/dom/${BASEMENT_ID}`,
      ariaLabel: withTarget(`Kocioł: ${formatTemperature(status?.boilerTemperature)}`, formatTarget(status?.boilerTargetTemperature)),
    },
    {
      id: 'cwu',
      anchor: [TANK.x, TANK.y, TANK.top - 0.9],
      row: 0,
      alignEnd: false,
      value: formatTemperature(status?.hotWaterTemperature),
      target: formatTarget(status?.hotWaterTargetTemperature),
      label: 'Ciepła woda',
      to: `/dom/${BASEMENT_ID}`,
      ariaLabel: withTarget(
        `Ciepła woda: ${formatTemperature(status?.hotWaterTemperature)}`,
        formatTarget(status?.hotWaterTargetTemperature),
      ),
    },
  ]
}

export function HouseIllustration({ status, mixers }: HouseIllustrationProps) {
  const burning = (status?.boilerPowerPercent ?? 0) > 0
  const callouts = buildCallouts(status, mixers)
  const pumpOn = (floorId: LivingFloorId) => {
    const circuit = circuitForFloor(floorId)
    return Boolean(circuit && findMixer(mixers, circuit.mixerId)?.pump)
  }

  return (
    <div className={styles.container}>
      <svg className={styles.svg} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} role="group" aria-label="Dom">
        <polygon className={styles.plateSide} points={iso.points([-PLATE, D + PLATE, 0], [W + PLATE, D + PLATE, 0], [W + PLATE, D + PLATE, -0.4], [-PLATE, D + PLATE, -0.4])} />
        <polygon className={styles.plateSide} points={iso.points([W + PLATE, -PLATE, 0], [W + PLATE, D + PLATE, 0], [W + PLATE, D + PLATE, -0.4], [W + PLATE, -PLATE, -0.4])} />
        <polygon className={styles.plateTop} points={iso.points([-PLATE, -PLATE, 0], [W + PLATE, -PLATE, 0], [W + PLATE, D + PLATE, 0], [-PLATE, D + PLATE, 0])} />

        <polygon className={styles.glassBack} points={iso.points([0, 0, BASE], [W, 0, BASE], [W, D, BASE], [0, D, BASE])} />
        <polygon className={styles.glassBack} points={iso.points([0, 0, BASE], [0, D, BASE], [0, D, 0], [0, 0, 0])} />
        <polygon className={styles.glassBack} points={iso.points([0, 0, BASE], [W, 0, BASE], [W, 0, 0], [0, 0, 0])} />
        <FlowPipe path={HOT_WATER_PIPE} temperature={status?.hotWaterTemperature} flowing={Boolean(status?.hotWaterPump)} />
        <BoilerUnit powerPercent={status?.boilerPowerPercent} />
        <WaterTank temperature={status?.hotWaterTemperature} />
        <FlowPipe path={SUPPLY_PIPE} temperature={status?.boilerTemperature} flowing={Boolean(status?.boilerPump)} />
        <polygon className={styles.glassFront} points={iso.points([0, D, BASE], [W, D, BASE], [W, D, 0], [0, D, 0])} />
        <polygon className={styles.glassFront} points={iso.points([W, 0, BASE], [W, D, BASE], [W, D, 0], [W, 0, 0])} />

        <polygon className={styles.roofBack} points={iso.points([-OVERHANG, -OVERHANG, EAVE], [W + OVERHANG, -OVERHANG, EAVE], [W + OVERHANG, D / 2, RIDGE], [-OVERHANG, D / 2, RIDGE])} />
        <Box x0={2} x1={3} y0={1} y1={2} z0={7} z1={9.8} />
        {burning &&
          [0, 1, 2].map((i) => {
            const top = iso.project([2.5, 1.5, 10.2])
            return <circle key={i} className={styles.smoke} cx={top.x} cy={top.y} r={6} />
          })}
        <polygon className={styles.wallLeft} points={iso.points([0, D, 0], [W, D, 0], [W, D, WALL], [0, D, WALL])} />
        <polygon className={styles.wallRight} points={iso.points([W, 0, 0], [W, D, 0], [W, D, WALL], [W, D / 2, RIDGE], [W, 0, WALL])} />
        <polyline className={styles.slab} points={iso.points([0, D, FLOOR], [W, D, FLOOR], [W, 0, FLOOR])} fill="none" />
        <polygon className={styles.door} points={iso.points([6.8, D, 0], [8, D, 0], [8, D, 2.2], [6.8, D, 2.2])} />
        {LIVING_FLOORS.map((floor) => (
          <FloorWindows key={floor.id} floorIndex={FLOOR_INDEX[floor.id]} warm={pumpOn(floor.id)} />
        ))}
        <polygon className={styles.roofFront} points={iso.points([-OVERHANG, D / 2, RIDGE], [W + OVERHANG, D / 2, RIDGE], [W + OVERHANG, D + OVERHANG, EAVE], [-OVERHANG, D + OVERHANG, EAVE])} />

        {LIVING_FLOORS.map((floor) => {
          const circuit = circuitForFloor(floor.id)
          const mixer = circuit && findMixer(mixers, circuit.mixerId)
          const path = PIPE_PATHS[floor.id]
          return (
            <g key={floor.id}>
              <FlowPipe path={path} temperature={mixer?.temperature} flowing={pumpOn(floor.id)} />
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

        {LIVING_FLOORS.map((floor) => (
          <FloorHitArea key={floor.id} floorId={floor.id} name={floor.name} />
        ))}
        <FloorHitArea floorId={BASEMENT_ID} name="Piwnica" />

        {callouts.map((callout) => {
          const anchor = iso.project(callout.anchor)
          const lineEnd = ROW_Y[callout.row] + LABEL_HEIGHT
          return (
            <g key={callout.id}>
              <line className={styles.calloutLine} x1={anchor.x} x2={anchor.x} y1={lineEnd} y2={anchor.y} />
              <circle className={styles.calloutDot} cx={anchor.x} cy={anchor.y} r={callout.color ? 5 : 4} style={callout.color ? { fill: callout.color } : undefined} />
            </g>
          )
        })}
      </svg>

      {callouts.map((callout) => {
        const anchor = iso.project(callout.anchor)
        const top = ROW_Y[callout.row]
        const position = callout.alignEnd
          ? { right: `${((VIEW_WIDTH - anchor.x + 8) / VIEW_WIDTH) * 100}%` }
          : { left: `${((anchor.x + 8) / VIEW_WIDTH) * 100}%` }
        return (
          <Link
            key={callout.id}
            className={callout.alignEnd ? `${styles.label} ${styles.labelEnd}` : styles.label}
            to={callout.to}
            aria-label={callout.ariaLabel}
            style={{ ...position, top: `${(top / VIEW_HEIGHT) * 100}%` }}
          >
            <span className={styles.labelValue}>
              {callout.value}
              {callout.target && (
                <span className={styles.labelTarget} title="Wartość zadana">
                  {' / '}
                  {callout.target}
                </span>
              )}
            </span>
            {callout.label && <span className={styles.labelText}>{callout.label}</span>}
            {callout.valvePercent !== undefined && <ValveGauge percent={callout.valvePercent} color={callout.color} />}
          </Link>
        )
      })}
    </div>
  )
}
