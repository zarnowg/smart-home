import type { BoilerStatus, MixerStatus } from './types'

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
