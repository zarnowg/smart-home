import styles from './BoilerSchematic.module.css'

interface FlameProps {
  x: number
  baseY: number
  powerPercent: number | null | undefined
}

function flamePath(x: number, baseY: number, width: number, height: number): string {
  const half = width / 2
  return (
    `M ${x - half} ${baseY} ` +
    `Q ${x - half} ${baseY - height * 0.6} ${x} ${baseY - height} ` +
    `Q ${x + half} ${baseY - height * 0.6} ${x + half} ${baseY} Z`
  )
}

export function Flame({ x, baseY, powerPercent }: FlameProps) {
  if (powerPercent == null || powerPercent <= 0) {
    return null
  }
  const power = Math.min(powerPercent, 100) / 100
  const height = 20 + 60 * power
  const width = 30 + 40 * power
  return (
    <g className={styles.flame} role="img" aria-label={`Płomień, moc ${powerPercent} %`}>
      <path d={flamePath(x, baseY, width, height)} fill="#f76707" />
      <path d={flamePath(x, baseY, width * 0.5, height * 0.6)} fill="#ffd43b" />
    </g>
  )
}
