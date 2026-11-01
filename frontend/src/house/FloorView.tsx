import styles from './House.module.css'
import { PLAN_HEIGHT, PLAN_WIDTH, type LivingFloor } from './houseConfig'
import { RoomShape } from './RoomShape'

interface FloorViewProps {
  floor: LivingFloor
}

const MARGIN = 4

export function FloorView({ floor }: FloorViewProps) {
  return (
    <svg
      className={styles.drawing}
      viewBox={`${-MARGIN} ${-MARGIN} ${PLAN_WIDTH + 2 * MARGIN} ${PLAN_HEIGHT + 2 * MARGIN}`}
      role="group"
      aria-label={`Plan: ${floor.name}`}
    >
      {floor.rooms.map((room) => (
        <RoomShape
          key={room.id}
          name={room.name}
          x={room.x}
          y={room.y}
          width={room.width}
          height={room.height}
          temperature={null}
          staircase={room.staircase}
        />
      ))}
    </svg>
  )
}
