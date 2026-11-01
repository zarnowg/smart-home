import type { ComponentType } from 'react'
import { ElectricityView } from './views/electricity/ElectricityView'
import { HeatingView } from './views/heating/HeatingView'
import { BoltIcon, FlameIcon } from './views/ViewIcons'

export interface HouseView {
  id: string
  name: string
  Icon: ComponentType
  Component: ComponentType
  boilerInfo: boolean
}

export const HOUSE_VIEWS: readonly HouseView[] = [
  { id: 'ogrzewanie', name: 'Ogrzewanie', Icon: FlameIcon, Component: HeatingView, boilerInfo: true },
  { id: 'elektrycznosc', name: 'Elektryczność', Icon: BoltIcon, Component: ElectricityView, boilerInfo: false },
]

export const DEFAULT_VIEW_PATH = `/dom/${HOUSE_VIEWS[0].id}`

export function showsBoilerInfo(pathname: string): boolean {
  return !HOUSE_VIEWS.some((view) => !view.boilerInfo && pathname === housePath(view))
}

export function housePath(view: HouseView): string {
  return `/dom/${view.id}`
}
