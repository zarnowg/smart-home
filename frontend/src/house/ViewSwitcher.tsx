import { Link } from 'react-router-dom'
import { HOUSE_VIEWS, housePath } from './houseViews'
import styles from './ViewSwitcher.module.css'

export function ViewSwitcher({ activeId }: { activeId: string }) {
  const activeIndex = Math.max(
    HOUSE_VIEWS.findIndex((view) => view.id === activeId),
    0,
  )
  return (
    <nav className={styles.switcher} aria-label="Widok domu">
      <span
        className={styles.indicator}
        aria-hidden="true"
        style={{
          width: `calc((100% - 10px) / ${HOUSE_VIEWS.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {HOUSE_VIEWS.map((view) => {
        const active = view.id === activeId
        return (
          <Link
            key={view.id}
            to={housePath(view)}
            data-view={view.id}
            className={active ? `${styles.option} ${styles.active}` : styles.option}
            aria-current={active ? 'page' : undefined}
          >
            <view.Icon />
            {view.name}
          </Link>
        )
      })}
    </nav>
  )
}
