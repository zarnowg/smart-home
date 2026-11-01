export type LivingFloorId = 'pietro' | 'parter'

export const BASEMENT_ID = 'piwnica'

export interface Room {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  staircase?: boolean
}

export interface LivingFloor {
  id: LivingFloorId
  name: string
  rooms: Room[]
}

export interface HeatingCircuit {
  mixerId: number
  floorId: LivingFloorId
  name: string
  color: string
}

export const PLAN_WIDTH = 1000
export const PLAN_HEIGHT = 600

function rooms(floorId: LivingFloorId): Room[] {
  return [
    { id: `${floorId}-pokoj-1`, name: 'Pokój 1', x: 0, y: 0, width: 350, height: 300 },
    { id: `${floorId}-pokoj-2`, name: 'Pokój 2', x: 350, y: 0, width: 300, height: 300 },
    {
      id: `${floorId}-klatka`,
      name: 'Klatka schodowa',
      x: 400,
      y: 300,
      width: 200,
      height: 300,
      staircase: true,
    },
    { id: `${floorId}-pokoj-3`, name: 'Pokój 3', x: 650, y: 0, width: 350, height: 300 },
    { id: `${floorId}-pokoj-4`, name: 'Pokój 4', x: 0, y: 300, width: 400, height: 300 },
    { id: `${floorId}-pokoj-5`, name: 'Pokój 5', x: 600, y: 300, width: 400, height: 300 },
  ]
}

export const LIVING_FLOORS: LivingFloor[] = [
  { id: 'pietro', name: '1. piętro', rooms: rooms('pietro') },
  { id: 'parter', name: 'Parter', rooms: rooms('parter') },
]

export const HEATING_CIRCUITS: HeatingCircuit[] = [
  { mixerId: 1, floorId: 'pietro', name: 'Grzejniki', color: '#5b7cfa' },
  { mixerId: 2, floorId: 'parter', name: 'Podłogówka', color: '#f08c5a' },
]

export const RISER_X: Record<LivingFloorId, number> = {
  parter: 970,
  pietro: 988,
}

export function findFloor(id: string | undefined): LivingFloor | undefined {
  return LIVING_FLOORS.find((floor) => floor.id === id)
}

export function circuitForFloor(id: LivingFloorId): HeatingCircuit | undefined {
  return HEATING_CIRCUITS.find((circuit) => circuit.floorId === id)
}
