import { useId } from 'react'
import { formatPercent, formatTemperature } from '../../../format'
import type { Vec3 } from '../../iso'
import { Box } from '../../scene/Box'
import { iso, ISO_ELLIPSE_X, ISO_ELLIPSE_Y, SCALE } from '../../scene/geometry'
import { temperatureColor } from '../../temperatureColor'
import { ACTUATOR, BOILER, FLAME_BASE, FLAME_X, PORT_LENGTH, TANK } from './heatingGeometry'
import styles from './HeatingView.module.css'

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

export function BoilerUnit({ powerPercent }: { powerPercent: number | null | undefined }) {
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

export function WaterTank({ temperature }: { temperature: number | null | undefined }) {
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

export function MixingValve({ center, outlet, color, valvePercent, label }: MixingValveProps) {
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

export function CircuitTag({ at, mixerId, color }: { at: Vec3; mixerId: number; color: string }) {
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

export function FlowPipe({ path, temperature, flowing }: { path: Vec3[]; temperature: number | null | undefined; flowing: boolean }) {
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

const GAUGE_PIVOT = { x: 2, y: 20 }
const GAUGE_RADIUS = 17

function gaugePoint(percent: number) {
  const angle = (Math.min(Math.max(percent, 0), 100) / 100) * (Math.PI / 2)
  return {
    x: GAUGE_PIVOT.x + GAUGE_RADIUS * Math.cos(angle),
    y: GAUGE_PIVOT.y - GAUGE_RADIUS * Math.sin(angle),
  }
}

export function ValveGauge({ percent, color }: { percent: number | null | undefined; color?: string }) {
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
