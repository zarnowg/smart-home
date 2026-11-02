import type { KeyboardEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BASEMENT_ID, LIVING_FLOORS, type LivingFloorId } from '../houseConfig'
import type { Vec3 } from '../iso'
import { Box } from './Box'
import { ScenePins } from './ScenePins'
import {
  BASE,
  D,
  EAVE,
  FLOOR,
  FLOOR_INDEX,
  iso,
  LABEL_HEIGHT,
  OVERHANG,
  PLATE,
  RIDGE,
  ROW_Y,
  VIEW_HEIGHT,
  VIEW_TOP,
  VIEW_WIDTH,
  W,
  WALL,
  type Callout,
} from './geometry'
import styles from './HouseScene.module.css'

interface HouseSceneProps {
  basement?: ReactNode
  overlay?: ReactNode
  callouts?: Callout[]
  warmFloors?: readonly LivingFloorId[]
  smoking?: boolean
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

function CalloutLabel({ callout }: { callout: Callout }) {
  const anchor = iso.project(callout.anchor)
  const position = callout.alignEnd
    ? { right: `${((VIEW_WIDTH - anchor.x + 8) / VIEW_WIDTH) * 100}%` }
    : { left: `${((anchor.x + 8) / VIEW_WIDTH) * 100}%` }
  return (
    <Link
      className={callout.alignEnd ? `${styles.label} ${styles.labelEnd}` : styles.label}
      to={callout.to}
      aria-label={callout.ariaLabel}
      style={{ ...position, top: `${((ROW_Y[callout.row] - VIEW_TOP) / VIEW_HEIGHT) * 100}%` }}
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
      {callout.extra}
    </Link>
  )
}

const GRID_EXTENT = 4
const GRID_LINES = Array.from({ length: 11 }, (_, index) => -2 + index * 1.4)

function gridLine(from: Vec3, to: Vec3) {
  const start = iso.project(from)
  const end = iso.project(to)
  return { x1: start.x, y1: start.y, x2: end.x, y2: end.y }
}

export function HouseScene({ basement, overlay, callouts = [], warmFloors = [], smoking = false }: HouseSceneProps) {
  const chimneyTop = iso.project([2.5, 1.5, 10.2])
  return (
    <div className={styles.container} style={{ aspectRatio: `${VIEW_WIDTH} / ${VIEW_HEIGHT}` }}>
      <svg className={styles.svg} viewBox={`0 ${VIEW_TOP} ${VIEW_WIDTH} ${VIEW_HEIGHT}`} role="group" aria-label="Dom">
        <defs>
          <linearGradient id="pin-beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#4fc3ff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#4fc3ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon className={styles.plateSide} points={iso.points([-PLATE, D + PLATE, 0], [W + PLATE, D + PLATE, 0], [W + PLATE, D + PLATE, -0.4], [-PLATE, D + PLATE, -0.4])} />
        <polygon className={styles.plateSide} points={iso.points([W + PLATE, -PLATE, 0], [W + PLATE, D + PLATE, 0], [W + PLATE, D + PLATE, -0.4], [W + PLATE, -PLATE, -0.4])} />
        <polygon className={styles.plateTop} points={iso.points([-PLATE, -PLATE, 0], [W + PLATE, -PLATE, 0], [W + PLATE, D + PLATE, 0], [-PLATE, D + PLATE, 0])} />
        <g className={styles.grid}>
          {GRID_LINES.map((offset) => (
            <g key={offset}>
              <line {...gridLine([offset, -GRID_EXTENT, 0], [offset, D + GRID_EXTENT, 0])} />
              <line {...gridLine([-GRID_EXTENT, offset, 0], [W + GRID_EXTENT, offset, 0])} />
            </g>
          ))}
        </g>

        <polygon className={styles.glassBack} points={iso.points([0, 0, BASE], [W, 0, BASE], [W, D, BASE], [0, D, BASE])} />
        <polygon className={styles.glassBack} points={iso.points([0, 0, BASE], [0, D, BASE], [0, D, 0], [0, 0, 0])} />
        <polygon className={styles.glassBack} points={iso.points([0, 0, BASE], [W, 0, BASE], [W, 0, 0], [0, 0, 0])} />
        {basement}
        <polygon className={styles.glassFront} points={iso.points([0, D, BASE], [W, D, BASE], [W, D, 0], [0, D, 0])} />
        <polygon className={styles.glassFront} points={iso.points([W, 0, BASE], [W, D, BASE], [W, D, 0], [W, 0, 0])} />

        <polygon className={styles.roofBack} points={iso.points([-OVERHANG, -OVERHANG, EAVE], [W + OVERHANG, -OVERHANG, EAVE], [W + OVERHANG, D / 2, RIDGE], [-OVERHANG, D / 2, RIDGE])} />
        <Box x0={2} x1={3} y0={1} y1={2} z0={7} z1={9.8} />
        {smoking && (
          <g>
            {[0, 1, 2].map((i) => (
              <circle key={i} className={styles.smoke} cx={chimneyTop.x} cy={chimneyTop.y} r={6} />
            ))}
          </g>
        )}
        <polygon className={styles.wallLeft} points={iso.points([0, D, 0], [W, D, 0], [W, D, WALL], [0, D, WALL])} />
        <polygon className={styles.wallRight} points={iso.points([W, 0, 0], [W, D, 0], [W, D, WALL], [W, D / 2, RIDGE], [W, 0, WALL])} />
        <polyline className={styles.slab} points={iso.points([0, D, FLOOR], [W, D, FLOOR], [W, 0, FLOOR])} fill="none" />
        <polygon className={styles.door} points={iso.points([6.8, D, 0], [8, D, 0], [8, D, 2.2], [6.8, D, 2.2])} />
        {LIVING_FLOORS.map((floor) => (
          <FloorWindows key={floor.id} floorIndex={FLOOR_INDEX[floor.id]} warm={warmFloors.includes(floor.id)} />
        ))}
        <polygon className={styles.roofFront} points={iso.points([-OVERHANG, D / 2, RIDGE], [W + OVERHANG, D / 2, RIDGE], [W + OVERHANG, D + OVERHANG, EAVE], [-OVERHANG, D + OVERHANG, EAVE])} />

        {overlay}
        <ScenePins />

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

      {callouts.map((callout) => (
        <CalloutLabel key={callout.id} callout={callout} />
      ))}
    </div>
  )
}
