import { useQueries, useQuery } from '@tanstack/react-query'
import { getBoilerStatus, getHistory, getMixers, type HistoryQuery } from './client'

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

export function useHistorySeries(queries: HistoryQuery[]) {
  return useQueries({
    queries: queries.map((query) => ({
      queryKey: ['history', query],
      queryFn: () => getHistory(query),
      refetchInterval: 60_000,
    })),
  })
}
