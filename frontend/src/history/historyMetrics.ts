export interface HistorySeries {
  id: string
  label: string
  metric: string
  sourceId: string
  color: string
  dashed?: boolean
}

export interface HistoryParameter {
  id: string
  label: string
  unit: string
  decimals: number
  series: HistorySeries[]
}

export interface HistoryRange {
  id: string
  label: string
  hours: number
  bucketMinutes: number
}

const M1_COLOR = '#7b8cf0'
const M2_COLOR = '#f08c5a'

export const HISTORY_PARAMETERS: readonly HistoryParameter[] = [
  {
    id: 'kociol',
    label: 'Kocioł',
    unit: '°C',
    decimals: 1,
    series: [{ id: 'kociol', label: 'Kocioł', metric: 'boiler.temperature', sourceId: '1', color: '#ec4bc8' }],
  },
  {
    id: 'cwu',
    label: 'Ciepła woda',
    unit: '°C',
    decimals: 1,
    series: [{ id: 'cwu', label: 'CWU', metric: 'hotWater.temperature', sourceId: '1', color: '#4fc3ff' }],
  },
  {
    id: 'mieszacze',
    label: 'Mieszacze',
    unit: '°C',
    decimals: 1,
    series: [
      { id: 'm1', label: 'M1', metric: 'mixer.temperature', sourceId: '1', color: M1_COLOR },
      { id: 'm1-zadana', label: 'M1 zadana', metric: 'mixer.targetTemperature', sourceId: '1', color: M1_COLOR, dashed: true },
      { id: 'm2', label: 'M2', metric: 'mixer.temperature', sourceId: '2', color: M2_COLOR },
      { id: 'm2-zadana', label: 'M2 zadana', metric: 'mixer.targetTemperature', sourceId: '2', color: M2_COLOR, dashed: true },
    ],
  },
  {
    id: 'zawory',
    label: 'Zawory M1/M2',
    unit: '%',
    decimals: 0,
    series: [
      { id: 'zawor-m1', label: 'Zawór M1', metric: 'mixer.valvePercent', sourceId: '1', color: M1_COLOR },
      { id: 'zawor-m2', label: 'Zawór M2', metric: 'mixer.valvePercent', sourceId: '2', color: M2_COLOR },
    ],
  },
  {
    id: 'zewnetrzna',
    label: 'Na zewnątrz',
    unit: '°C',
    decimals: 1,
    series: [{ id: 'zewnetrzna', label: 'Na zewnątrz', metric: 'outdoor.temperature', sourceId: '1', color: '#5ee6b8' }],
  },
  {
    id: 'moc',
    label: 'Moc kotła',
    unit: '%',
    decimals: 0,
    series: [{ id: 'moc', label: 'Moc kotła', metric: 'boiler.powerPercent', sourceId: '1', color: '#ffb340' }],
  },
  {
    id: 'paliwo',
    label: 'Paliwo',
    unit: '%',
    decimals: 0,
    series: [{ id: 'paliwo', label: 'Poziom paliwa', metric: 'fuel.levelPercent', sourceId: '1', color: '#d99a5b' }],
  },
]

export const HISTORY_RANGES: readonly HistoryRange[] = [
  { id: '3h', label: '3 godz.', hours: 3, bucketMinutes: 1 },
  { id: '6h', label: '6 godz.', hours: 6, bucketMinutes: 1 },
  { id: '12h', label: '12 godz.', hours: 12, bucketMinutes: 2 },
  { id: '24h', label: '24 godz.', hours: 24, bucketMinutes: 5 },
  { id: '7d', label: '7 dni', hours: 168, bucketMinutes: 30 },
]

export const DEFAULT_RANGE = HISTORY_RANGES[1]

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function toLocalIso(date: Date): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function rangeWindow(range: HistoryRange, now: Date) {
  const end = new Date(now)
  end.setSeconds(0, 0)
  const start = new Date(end.getTime() - range.hours * 3_600_000)
  return { start, end, from: toLocalIso(start), to: toLocalIso(end) }
}

export interface SeriesStats {
  last: number | null
  min: number | null
  max: number | null
  average: number | null
}

export function seriesStats(values: Array<number | null>): SeriesStats {
  const present = values.filter((value): value is number => value != null)
  if (present.length === 0) {
    return { last: null, min: null, max: null, average: null }
  }
  return {
    last: present[present.length - 1],
    min: Math.min(...present),
    max: Math.max(...present),
    average: present.reduce((sum, value) => sum + value, 0) / present.length,
  }
}
