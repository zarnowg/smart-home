import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import styles from './App.module.css'
import { BoilerPage } from './pages/BoilerPage'
import { FloorPage } from './pages/FloorPage'
import { DEFAULT_VIEW_PATH, HOUSE_VIEWS, housePath, showsBoilerInfo } from './house/houseViews'
import { HousePage } from './pages/HousePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
})

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link
}

function MainNav() {
  const { pathname } = useLocation()
  if (!showsBoilerInfo(pathname)) {
    return null
  }
  return (
    <nav className={styles.nav}>
      <NavLink to="/dom" className={linkClass}>
        Plan domu
      </NavLink>
      <NavLink to="/piec" className={linkClass}>
        Piec
      </NavLink>
    </nav>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className={styles.layout}>
          <header className={styles.header}>
            <h1 className={styles.logo}>Smart Home</h1>
            <MainNav />
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Navigate to={DEFAULT_VIEW_PATH} replace />} />
              <Route path="/dom" element={<Navigate to={DEFAULT_VIEW_PATH} replace />} />
              {HOUSE_VIEWS.map((view) => (
                <Route key={view.id} path={housePath(view)} element={<HousePage viewId={view.id} />} />
              ))}
              <Route path="/dom/:floorId" element={<FloorPage />} />
              <Route path="/piec" element={<BoilerPage />} />
              <Route path="*" element={<Navigate to={DEFAULT_VIEW_PATH} replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
