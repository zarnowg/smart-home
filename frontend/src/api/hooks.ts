import { useQuery } from '@tanstack/react-query'
import { getBoilerStatus, getMixers } from './client'

export const REFRESH_INTERVAL_MS = 30_000

export function useBoilerStatus() {
  return useQuery({
    queryKey: ['boiler', 'status'],
    queryFn: getBoilerStatus,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}

export function useMixers() {
  return useQuery({
    queryKey: ['boiler', 'mixers'],
    queryFn: getMixers,
    refetchInterval: REFRESH_INTERVAL_MS,
  })
}
