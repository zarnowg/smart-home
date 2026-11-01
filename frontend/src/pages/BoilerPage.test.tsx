import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOILER_STATUS, MIXER, mockApi } from '../test/fixtures'
import { BoilerPage } from './BoilerPage'

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <BoilerPage />
    </QueryClientProvider>,
  )
}

describe('BoilerPage', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('givenBoilerAndMixerData_whenRendered_thenShowsCurrentParameters', async () => {
    // given
    mockApi({
      '/api/boiler/status': () => Response.json(BOILER_STATUS),
      '/api/boiler/mixers/details': () => Response.json([MIXER]),
    })

    // when
    renderPage()

    // then
    expect(await screen.findByText('65,4 °C')).toBeTruthy()
    expect(screen.getByText('-2,5 °C')).toBeTruthy()
    expect(screen.getByRole('progressbar', { name: 'Moc kotła' }).getAttribute('aria-valuenow')).toBe('50')
    const mixer = await screen.findByRole('article', { name: 'Mieszacz 2' })
    expect(within(mixer).getByText('Otwiera')).toBeTruthy()
    expect(within(mixer).getByText('30 %')).toBeTruthy()
  })

  it('givenBackendError_whenRendered_thenShowsConnectionAlert', async () => {
    // given
    mockApi({
      '/api/boiler/status': () => new Response(null, { status: 502 }),
      '/api/boiler/mixers/details': () => new Response(null, { status: 502 }),
    })

    // when
    renderPage()

    // then
    expect((await screen.findByRole('alert')).textContent).toBe('Brak połączenia z piecem')
  })
})
