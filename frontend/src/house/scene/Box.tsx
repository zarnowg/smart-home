import { iso } from './geometry'
import styles from './HouseScene.module.css'

type BoxProps = Record<'x0' | 'x1' | 'y0' | 'y1' | 'z0' | 'z1', number> & { topFill?: string }

export function Box({ x0, x1, y0, y1, z0, z1, topFill }: BoxProps) {
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
