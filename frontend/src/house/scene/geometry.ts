import type { ReactNode } from 'react'
import type { LivingFloorId } from '../houseConfig'
import { createIso, type Vec3 } from '../iso'

export const VIEW_WIDTH = 720
export const VIEW_TOP = -120
export const VIEW_HEIGHT = 845
export const ROW_Y = [560, 635]
export const LABEL_HEIGHT = 50

export const W = 10
export const D = 7
export const FLOOR = 3
export const WALL = 6
export const BASE = -3
export const RIDGE = 8.8
export const EAVE = 5.7
export const OVERHANG = 0.4
export const PLATE = 2

export const SCALE = 24
export const iso = createIso(329, 262, SCALE)

export const ISO_ELLIPSE_X = Math.sqrt(1.5)
export const ISO_ELLIPSE_Y = Math.SQRT1_2

export const FLOOR_INDEX: Record<LivingFloorId, number> = { parter: 0, pietro: 1 }

export interface Callout {
  id: string
  anchor: Vec3
  row: 0 | 1
  alignEnd: boolean
  color?: string
  value: string
  target?: string | null
  label?: string
  extra?: ReactNode
  to: string
  ariaLabel: string
}
