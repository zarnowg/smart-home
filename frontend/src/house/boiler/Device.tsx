import type { SVGProps } from 'react'
import styles from './BoilerSchematic.module.css'

type DeviceKind = 'pump' | 'fan' | 'auger'
type LabelPosition = 'above' | 'below' | 'left' | 'right'

interface DeviceProps {
  x: number
  y: number
  label: string
  on: boolean | null | undefined
  kind?: DeviceKind
  labelPosition?: LabelPosition
  name?: string
}

const RADIUS = 14

function stateText(on: boolean | null | undefined): string {
  if (on == null) {
    return 'brak danych'
  }
  return on ? 'pracuje' : 'stoi'
}

function Icon({ kind }: { kind: DeviceKind }) {
  switch (kind) {
    case 'fan':
      return <path d="M0 0 L0 -9 M0 0 L7.8 4.5 M0 0 L-7.8 4.5" />
    case 'auger':
      return <path d="M-8 -4 L-4 4 L0 -4 L4 4 L8 -4" />
    default:
      return <path d="M-5 -7 L8 0 L-5 7 Z" />
  }
}

function labelProps(position: LabelPosition): SVGProps<SVGTextElement> {
  switch (position) {
    case 'above':
      return { x: 0, y: -RADIUS - 6, textAnchor: 'middle' }
    case 'left':
      return { x: -RADIUS - 6, y: 4, textAnchor: 'end' }
    case 'right':
      return { x: RADIUS + 6, y: 4, textAnchor: 'start' }
    default:
      return { x: 0, y: RADIUS + 16, textAnchor: 'middle' }
  }
}

export function Device({ x, y, label, on, kind = 'pump', labelPosition = 'below', name = label }: DeviceProps) {
  const color = on ? '#4fd8ff' : '#7a6bb8'
  return (
    <g transform={`translate(${x} ${y})`} role="img" aria-label={`${name}: ${stateText(on)}`}>
      <circle className={styles.device} r={RADIUS} stroke={color} />
      <g className={on ? `${styles.icon} ${styles.spin}` : styles.icon} stroke={color}>
        <Icon kind={kind} />
      </g>
      <text className={styles.label} {...labelProps(labelPosition)}>
        {label}
      </text>
    </g>
  )
}
