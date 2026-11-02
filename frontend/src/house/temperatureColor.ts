export const NO_DATA_COLOR = '#7a6bb8'

const COLD_HUE = 220

export function temperatureColor(value: number | null | undefined, min = 20, max = 80): string {
  if (value == null) {
    return NO_DATA_COLOR
  }
  const ratio = Math.min(Math.max((value - min) / (max - min), 0), 1)
  return `hsl(${Math.round(COLD_HUE * (1 - ratio))}, 75%, 50%)`
}
