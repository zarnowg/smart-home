import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOILER_STATUS, MIXER, mockApi } from '../test/fixtures'
import { DEFAULT_VIEW_PATH, HOUSE_VIEWS, housePath } from '../house/houseViews'
import { FloorPage } from './FloorPage'
import { HousePage } from './HousePage'

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/dom" element={<Navigate to={DEFAULT_VIEW_PATH} replace />} />
          {HOUSE_VIEWS.map((view) => (
            <Route key={view.id} path={housePath(view)} element={<HousePage viewId={view.id} />} />
          ))}
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
    renderAt('/dom/ogrzewanie')

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
    renderAt('/dom/ogrzewanie')

    // when
    fireEvent.click(await screen.findByRole('link', { name: 'Mieszacz 2 → Parter: 35,5 °C, zadana 40 °C, otwarcie zaworu 30 %' }))

    // then
    const plan = await screen.findByRole('group', { name: 'Plan: Parter' })
    expect(within(plan).getAllByText(/^Pokój \d$/)).toHaveLength(5)
    expect(within(plan).getByText('Klatka schodowa')).toBeTruthy()
  })

  it('givenHouseScene_whenFloorClicked_thenShowsFloorPlan', async () => {
    // given
    mockApi({
      '/api/boiler/status': () => Response.json(BOILER_STATUS),
      '/api/boiler/mixers/details': () => Response.json([MIXER]),
    })
    renderAt('/dom/ogrzewanie')

    // when
    fireEvent.click(await screen.findByRole('link', { name: 'Parter – pokaż plan' }))

    // then
    expect(await screen.findByRole('heading', { name: 'Parter' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Plan: Parter' })).toBeTruthy()
  })
  it('givenHouseAddress_whenOpened_thenShowsHeatingViewAsDefault', async () => {
    // given
    mockApi({
      '/api/boiler/status': () => Response.json(BOILER_STATUS),
      '/api/boiler/mixers/details': () => Response.json([MIXER]),
    })

    // when
    renderAt('/dom')

    // then
    expect(await screen.findByRole('link', { name: 'Kocioł: 65,4 °C, zadana 70 °C' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ogrzewanie' }).getAttribute('aria-current')).toBe('page')
  })

  it('givenHeatingView_whenElectricitySelected_thenShowsHouseWithoutHeatingValuesAndBoilerStatus', async () => {
    // given
    mockApi({
      '/api/boiler/status': () => Response.json(BOILER_STATUS),
      '/api/boiler/mixers/details': () => Response.json([MIXER]),
    })
    renderAt('/dom/ogrzewanie')
    await screen.findByRole('link', { name: 'Kocioł: 65,4 °C, zadana 70 °C' })

    // when
    fireEvent.click(screen.getByRole('link', { name: 'Elektryczność' }))

    // then
    expect(await screen.findByText('Dane o prądzie pojawią się wkrótce')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Elektryczność' }).getAttribute('aria-current')).toBe('page')
    expect(screen.queryByRole('link', { name: /^Kocioł:/ })).toBeNull()
    expect(screen.queryByText('Piec pracuje')).toBeNull()
    expect(screen.getByText('-2,5 °C')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Parter – pokaż plan' })).toBeTruthy()
  })
})
