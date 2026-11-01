export const EMPTY = '—'

const numberFormat = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 })

const timeFormat = new Intl.DateTimeFormat('pl-PL', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function formatNumber(value: number | null | undefined): string {
  return value == null ? EMPTY : numberFormat.format(value)
}

export function formatTemperature(value: number | null | undefined): string {
  return value == null ? EMPTY : `${numberFormat.format(value)} °C`
}

export function formatPercent(value: number | null | undefined): string {
  return value == null ? EMPTY : `${numberFormat.format(value)} %`
}

export function formatTime(timestamp: number): string {
  return timestamp ? timeFormat.format(timestamp) : EMPTY
}

export function formatOnOff(value: boolean | null | undefined): string {
  if (value == null) {
    return EMPTY
  }
  return value ? 'Wł.' : 'Wył.'
}

const ACTUATOR_LABELS: Record<string, string> = {
  STOP: 'Stoi',
  OPENING: 'Otwiera',
  CLOSING: 'Zamyka',
}

export function formatActuator(value: string | null | undefined): string {
  if (value == null) {
    return EMPTY
  }
  return ACTUATOR_LABELS[value] ?? value
}
