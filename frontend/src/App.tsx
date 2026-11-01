import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import styles from './App.module.css'
import { BoilerPage } from './pages/BoilerPage'
import { FloorPage } from './pages/FloorPage'
import { HousePage } from './pages/HousePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
})

function linkClass({ isActive }: { isActive: boolean }) {
  return isActive ? `${styles.link} ${styles.active}` : styles.link
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className={styles.layout}>
          <header className={styles.header}>
            <h1 className={styles.logo}>Smart Home</h1>
            <nav className={styles.nav}>
              <NavLink to="/dom" className={linkClass}>
                Plan domu
              </NavLink>
              <NavLink to="/piec" className={linkClass}>
                Piec
              </NavLink>
            </nav>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Navigate to="/dom" replace />} />
              <Route path="/dom" element={<HousePage />} />
              <Route path="/dom/:floorId" element={<FloorPage />} />
              <Route path="/piec" element={<BoilerPage />} />
              <Route path="*" element={<Navigate to="/dom" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
