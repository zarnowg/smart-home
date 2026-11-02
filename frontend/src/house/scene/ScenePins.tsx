import type { KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { D, iso, RIDGE } from './geometry'
import type { Vec3 } from '../iso'
import styles from './HouseScene.module.css'

interface PinSpec {
  id: string
  label: string
  to: string
  anchor: Vec3
  rise: number
  icon: string
  active: (pathname: string) => boolean
}

const FLAME_ICON =
  'M12 2.5c.6 3.1-1 4.9-2.6 6.7C7.9 10.9 6.5 12.6 6.5 15a5.5 5.5 0 0 0 11 0c0-2.4-1.2-4-2.3-5.3-.3 1.4-1 2.4-2.1 2.9.6-3.4-.1-7-1.1-10.1Z'
const BOLT_ICON = 'M13.5 2 5 13.5h5.5L9.5 22 19 9.8h-5.6L13.5 2Z'
const GAUGE_ICON =
  'M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Zm0 2a7 7 0 0 1 6.3 4h-2.1l-1.6 1.1A3 3 0 1 0 15 12h2l1.9-.1A7 7 0 1 1 12 5Z'

const PINS: readonly PinSpec[] = [
  {
    id: 'ogrzewanie',
    label: 'Ogrzewanie',
    to: '/dom/ogrzewanie',
    anchor: [0.5, D / 2, RIDGE],
    rise: 70,
    icon: FLAME_ICON,
    active: (pathname) => pathname !== '/dom/elektrycznosc' && pathname.startsWith('/dom'),
  },
  {
    id: 'elektrycznosc',
    label: 'Elektryczność',
    to: '/dom/elektrycznosc',
    anchor: [2.5, 1.5, 10.2],
    rise: 70,
    icon: BOLT_ICON,
    active: (pathname) => pathname === '/dom/elektrycznosc',
  },
  {
    id: 'piec',
    label: 'Piec',
    to: '/piec',
    anchor: [8, D / 2, RIDGE],
    rise: 110,
    icon: GAUGE_ICON,
    active: (pathname) => pathname === '/piec',
  },
]

const PIN_PATH = 'M0 0 C-4 -10 -17 -18 -17 -33 A17 17 0 1 1 17 -33 C17 -18 4 -10 0 0Z'
const BEAM_TOP = -120

function Pin({ pin, active }: { pin: PinSpec; active: boolean }) {
  const navigate = useNavigate()
  const anchor = iso.project(pin.anchor)
  const tipY = anchor.y - pin.rise
  const open = () => navigate(pin.to)
  return (
    <g>
      <rect className={styles.pinBeam} x={anchor.x - 9} y={BEAM_TOP} width={18} height={tipY - 50 - BEAM_TOP} />
      <line className={styles.pinLine} x1={anchor.x} x2={anchor.x} y1={tipY} y2={anchor.y} />
      <circle className={styles.pinDot} cx={anchor.x} cy={anchor.y} r={4} />
      <g
        className={active ? `${styles.pin} ${styles.pinActive}` : styles.pin}
        transform={`translate(${anchor.x} ${tipY})`}
        role="link"
        tabIndex={0}
        aria-label={pin.label}
        aria-current={active ? 'page' : undefined}
        onClick={open}
        onKeyDown={(event: KeyboardEvent) => event.key === 'Enter' && open()}
      >
        <title>{pin.label}</title>
        <path className={styles.pinShadow} d={PIN_PATH} transform="translate(5 3)" />
        <path className={styles.pinBody} d={PIN_PATH} />
        <path className={styles.pinIcon} d={pin.icon} transform="translate(-9 -42) scale(0.75)" />
      </g>
    </g>
  )
}

export function ScenePins() {
  const { pathname } = useLocation()
  return (
    <g>
      {PINS.map((pin) => (
        <Pin key={pin.id} pin={pin} active={pin.active(pathname)} />
      ))}
    </g>
  )
}
