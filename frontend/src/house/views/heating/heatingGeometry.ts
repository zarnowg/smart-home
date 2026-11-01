import type { LivingFloorId } from '../../houseConfig'
import type { Vec3 } from '../../iso'
import { BASE, D, W } from '../../scene/geometry'

export const SUPPLY_Y = 6
export const SUPPLY_Z = -2.45
export const ACTUATOR = { half: 0.34, bottom: 0.62, top: 1.08 }
export const PORT_LENGTH = 0.55

export const MIXER_X: Record<LivingFloorId, number> = { parter: 6.2, pietro: 9 }

export const BOILER = { x0: 0.4, x1: 2.2, y0: D - 1.4, y1: D - 0.2, z0: BASE, z1: -1.5 }
export const FLAME_X = 1.3
export const FLAME_BASE = -2.68

export const SUPPLY_PIPE: Vec3[] = [
  [BOILER.x1, SUPPLY_Y, SUPPLY_Z],
  [MIXER_X.pietro, SUPPLY_Y, SUPPLY_Z],
]

export const PIPE_PATHS: Record<LivingFloorId, Vec3[]> = {
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

export const TANK = { x: 9.3, y: 1.6, radius: 0.55, bottom: BASE, top: -1.45 }

export const HOT_WATER_PIPE: Vec3[] = [
  [BOILER.x1, 5.75, -2],
  [2.8, 5.75, -2],
  [2.8, 1.6, -2],
  [TANK.x - TANK.radius, TANK.y, -2],
]
