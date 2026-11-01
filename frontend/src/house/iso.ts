export type Vec3 = [number, number, number]

export interface Point {
  x: number
  y: number
}

const COS_30 = Math.cos(Math.PI / 6)

export function createIso(originX: number, originY: number, scale: number) {
  const project = ([x, y, z]: Vec3): Point => ({
    x: originX + (x - y) * COS_30 * scale,
    y: originY + ((x + y) / 2 - z) * scale,
  })
  const points = (...vertices: Vec3[]): string =>
    vertices
      .map((vertex) => {
        const { x, y } = project(vertex)
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  return { project, points }
}
