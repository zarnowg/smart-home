import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOILER_STATUS, MIXER, mockApi } from '../test/fixtures'
import { FloorPage } from './FloorPage'
import { HousePage } from './HousePage'

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/dom" element={<HousePage />} />
          <Route path="/dom/:floorId" element={<FloorPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('HousePage', () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('givenHouseData_whenRendered_thenShowsCalloutsWithTargetsAndCardsWithLiveValues', async () => {
    // given
    mockApi({
      '/api/boiler/status': () => Response.json(BOILER_STATUS),
      '/api/boiler/mixers/details': () => Response.json([{ ...MIXER, id: 1, temperature: 31.2, targetTemperature: null }, MIXER]),
    })

    // when
    renderAt('/dom')

    // then
    expect(await screen.findByRole('link', { name: 'Mieszacz 1 → 1. piętro: 31,2 °C, otwarcie zaworu 30 %' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Mieszacz 2 → Parter: 35,5 °C, zadana 40 °C, otwarcie zaworu 30 %' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Kocioł: 65,4 °C, zadana 70 °C' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ciepła woda: 48 °C, zadana 50 °C' })).toBeTruthy()
    const upperCircuit = screen.getByRole('article', { name: '1. piętro · Grzejniki' })
    expect(within(upperCircuit).getByText('31,2')).toBeTruthy()
    expect(screen.getByText('Piec pracuje')).toBeTruthy()
    expect(screen.getByText('-2,5 °C')).toBeTruthy()
  })

  it('givenCalloutLink_whenClicked_thenShowsFloorPlanWithRooms', async () => {
    // given
    mockApi({
      '/api/boiler/status': () => Response.json(BOILER_STATUS),
      '/api/boiler/mixers/details': () => Response.json([MIXER]),
    })
    renderAt('/dom')

    // when
    fireEvent.click(await screen.findByRole('link', { name: 'Mieszacz 2 → Parter: 35,5 °C, zadana 40 °C, otwarcie zaworu 30 %' }))

    // then
    const plan = await screen.findByRole('group', { name: 'Plan: Parter' })
    expect(within(plan).getAllByText(/^Pokój \d$/)).toHaveLength(5)
    expect(within(plan).getByText('Klatka schodowa')).toBeTruthy()
  })

  it('givenHouseIllustration_whenFloorClicked_thenShowsFloorPlan', async () => {
    // given
    mockApi({
      '/api/boiler/status': () => Response.json(BOILER_STATUS),
      '/api/boiler/mixers/details': () => Response.json([MIXER]),
    })
    renderAt('/dom')

    // when
    fireEvent.click(await screen.findByRole('link', { name: 'Parter – pokaż plan' }))

    // then
    expect(await screen.findByRole('heading', { name: 'Parter' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Plan: Parter' })).toBeTruthy()
  })
})
