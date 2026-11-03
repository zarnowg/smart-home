import type { ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HOUSE_VIEWS, housePath } from '../house/houseViews'
import { ChartIcon, GaugeIcon, HomeIcon } from '../house/views/ViewIcons'
import styles from './Sidebar.module.css'

interface SidebarItem {
  id: string
  name: string
  to: string
  Icon: ComponentType
  isActive: (pathname: string) => boolean
}

const ELECTRICITY_ID = 'elektrycznosc'

const ITEMS: readonly SidebarItem[] = [
  ...HOUSE_VIEWS.map(
    (view): SidebarItem => ({
      id: view.id,
      name: view.name,
      to: housePath(view),
      Icon: view.Icon,
      isActive: (pathname) =>
        view.id === ELECTRICITY_ID
          ? pathname === housePath(view)
          : pathname.startsWith('/dom') && pathname !== `/dom/${ELECTRICITY_ID}`,
    }),
  ),
  { id: 'piec', name: 'Piec', to: '/piec', Icon: GaugeIcon, isActive: (pathname) => pathname === '/piec' },
  { id: 'historia', name: 'Historia', to: '/historia', Icon: ChartIcon, isActive: (pathname) => pathname === '/historia' },
]

export function Sidebar() {
  const { pathname } = useLocation()
  return (
    <aside className={styles.sidebar}>
      <Link to="/dom" className={styles.logo} aria-label="Smart Home">
        <HomeIcon />
      </Link>
      <nav className={styles.nav} aria-label="Menu główne">
        {ITEMS.map((item) => {
          const active = item.isActive(pathname)
          return (
            <Link
              key={item.id}
              to={item.to}
              title={item.name}
              className={active ? `${styles.item} ${styles.active}` : styles.item}
              aria-current={active ? 'page' : undefined}
            >
              <item.Icon />
              <span className={styles.name}>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
