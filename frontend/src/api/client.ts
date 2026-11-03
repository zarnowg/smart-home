import type { BoilerStatus, HistoryPoint, MixerStatus } from './types'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new ApiError(response.status, `${url}: HTTP ${response.status}`)
  }
  return (await response.json()) as T
}

export const getBoilerStatus = () => fetchJson<BoilerStatus>('/api/boiler/status')

export const getMixers = () => fetchJson<MixerStatus[]>('/api/boiler/mixers/details')

export interface HistoryQuery {
  metric: string
  sourceId: string
  from: string
  to: string
  bucketMinutes: number
}

export const getHistory = ({ metric, sourceId, from, to, bucketMinutes }: HistoryQuery) => {
  const params = new URLSearchParams({ sourceId, from, to, bucketMinutes: String(bucketMinutes) })
  return fetchJson<HistoryPoint[]>(`/api/history/${encodeURIComponent(metric)}?${params}`)
}
