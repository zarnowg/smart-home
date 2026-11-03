import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HistoryPage } from './HistoryPage'

function stubHistory(points: Array<{ time: string; value: number | null }>) {
  const fetchMock = vi.fn((url: string) =>
    Promise.resolve(url.startsWith('/api/history/') ? Response.json(points) : new Response(null, { status: 404 })),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderPage(path = '/historia') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <HistoryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('HistoryPage', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('givenHistoryPoints_whenRendered_thenShowsLastMinAndMaxValues', async () => {
    // given
    stubHistory([
      { time: '2025-01-15T10:00:00', value: 50 },
      { time: '2025-01-15T10:01:00', value: 70 },
    ])

    // when
    renderPage()

    // then
    expect(await screen.findByText('70 °C')).toBeTruthy()
    expect(screen.getByText(/min 50 °C/)).toBeTruthy()
  })

  it('givenNoHistoryPoints_whenRendered_thenShowsEmptyMessage', async () => {
    // given
    stubHistory([])

    // when
    renderPage()

    // then
    expect(await screen.findByText('Brak danych w wybranym zakresie.')).toBeTruthy()
  })

  it('givenPageOpen_whenRangeSelected_thenRequestsHistoryWithThatBucketSize', async () => {
    // given
    const fetchMock = stubHistory([])
    renderPage()
    await screen.findByText('Brak danych w wybranym zakresie.')

    // when
    fireEvent.click(screen.getByRole('button', { name: '7 dni' }))

    // then
    await vi.waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('bucketMinutes=30'))).toBe(true)
    })
  })

  it('givenParameterInUrl_whenRendered_thenThatParameterIsSelected', async () => {
    // given
    stubHistory([])

    // when
    renderPage('/historia?parametr=cwu')

    // then
    const chip = await screen.findByRole('button', { name: 'Ciepła woda' })
    expect(chip.getAttribute('aria-pressed')).toBe('true')
  })
})
