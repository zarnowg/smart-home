import { useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useHistorySeries } from '../api/hooks'
import { EMPTY } from '../format'
import {
  DEFAULT_RANGE,
  HISTORY_PARAMETERS,
  HISTORY_RANGES,
  rangeWindow,
  seriesStats,
  type HistoryParameter,
} from '../history/historyMetrics'
import styles from './HistoryPage.module.css'

const CLOCK_TICK_MS = 60_000

function useMinuteClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CLOCK_TICK_MS)
    return () => clearInterval(timer)
  }, [])
  return now
}

function formatValue(value: number | null, parameter: HistoryParameter): string {
  if (value == null) {
    return EMPTY
  }
  const text = value.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: parameter.decimals })
  return `${text} ${parameter.unit}`
}

function formatTick(timestamp: number, hours: number): string {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  if (hours <= 24) {
    return time
  }
  return `${date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })} ${time}`
}

export function HistoryPage() {
  const [searchParams] = useSearchParams()
  const [parameterId, setParameterId] = useState(() => {
    const requested = searchParams.get('parametr')
    return HISTORY_PARAMETERS.find((item) => item.id === requested)?.id ?? HISTORY_PARAMETERS[0].id
  })
  const [rangeId, setRangeId] = useState(DEFAULT_RANGE.id)
  const now = useMinuteClock()
  const parameter = HISTORY_PARAMETERS.find((item) => item.id === parameterId) ?? HISTORY_PARAMETERS[0]
  const range = HISTORY_RANGES.find((item) => item.id === rangeId) ?? DEFAULT_RANGE
  const window = useMemo(() => rangeWindow(range, now), [range, now])

  const results = useHistorySeries(
    parameter.series.map((series) => ({
      metric: series.metric,
      sourceId: series.sourceId,
      from: window.from,
      to: window.to,
      bucketMinutes: range.bucketMinutes,
    })),
  )
  const isLoading = results.some((result) => result.isPending)
  const isError = results.some((result) => result.isError)

  const { rows, stats } = useMemo(() => {
    const byTime = new Map<number, Record<string, number | null>>()
    const collected = parameter.series.map((series, index) => {
      const points = results[index]?.data ?? []
      for (const point of points) {
        const time = new Date(point.time).getTime()
        const row = byTime.get(time) ?? {}
        row[series.id] = point.value
        byTime.set(time, row)
      }
      return seriesStats(points.map((point) => point.value))
    })
    const merged = [...byTime.entries()].sort(([a], [b]) => a - b).map(([time, values]) => ({ time, ...values }))
    return { rows: merged, stats: collected }
  }, [parameter, results])

  const hasData = stats.some((item) => item.last != null)

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Historia</h2>

      <div className={styles.controls}>
        <div className={styles.chips} role="group" aria-label="Parametr">
          {HISTORY_PARAMETERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === parameter.id ? `${styles.chip} ${styles.chipActive}` : styles.chip}
              aria-pressed={item.id === parameter.id}
              onClick={() => setParameterId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className={styles.ranges} role="group" aria-label="Zakres czasu">
          {HISTORY_RANGES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === range.id ? `${styles.range} ${styles.rangeActive}` : styles.range}
              aria-pressed={item.id === range.id}
              onClick={() => setRangeId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className={styles.card} aria-label={`Wykres: ${parameter.label}`}>
        <ul className={styles.stats}>
          {parameter.series.map((series, index) => (
            <li key={series.id} className={styles.stat}>
              <span className={styles.statName}>
                <span
                  className={series.dashed ? `${styles.swatch} ${styles.swatchDashed}` : styles.swatch}
                  style={{ color: series.color }}
                />
                {series.label}
              </span>
              <span className={styles.statValue}>{formatValue(stats[index].last, parameter)}</span>
              <span className={styles.statRange}>
                min {formatValue(stats[index].min, parameter)} · śr. {formatValue(stats[index].average, parameter)} · max{' '}
                {formatValue(stats[index].max, parameter)}
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.chart}>
          {isError ? (
            <p className={styles.message} role="alert">
              Nie udało się pobrać historii.
            </p>
          ) : isLoading ? (
            <p className={styles.message}>Ładowanie wykresu…</p>
          ) : !hasData ? (
            <p className={styles.message}>Brak danych w wybranym zakresie.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid stroke="rgba(170, 140, 255, 0.14)" vertical={false} />
                <XAxis
                  dataKey="time"
                  type="number"
                  scale="time"
                  domain={[window.start.getTime(), window.end.getTime()]}
                  tickFormatter={(value: number) => formatTick(value, range.hours)}
                  tick={{ fill: '#a094cc', fontSize: 12 }}
                  stroke="rgba(170, 140, 255, 0.3)"
                  minTickGap={48}
                />
                <YAxis
                  width={48}
                  domain={['auto', 'auto']}
                  tick={{ fill: '#a094cc', fontSize: 12 }}
                  stroke="rgba(170, 140, 255, 0.3)"
                  tickFormatter={(value: number) => value.toLocaleString('pl-PL', { maximumFractionDigits: 1 })}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 8, 38, 0.92)',
                    border: '1px solid rgba(170, 140, 255, 0.3)',
                    borderRadius: 12,
                    color: '#f3eeff',
                  }}
                  labelFormatter={(value) => new Date(Number(value)).toLocaleString('pl-PL')}
                  formatter={(value, name) => [formatValue(value == null ? null : Number(value), parameter), name]}
                />
                {parameter.series.map((series) => (
                  <Line
                    key={series.id}
                    name={series.label}
                    dataKey={series.id}
                    type="monotone"
                    stroke={series.color}
                    strokeWidth={series.dashed ? 1.5 : 2.5}
                    strokeDasharray={series.dashed ? '6 5' : undefined}
                    dot={false}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                    style={series.dashed ? undefined : { filter: 'url(#line-glow)' }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  )
}
