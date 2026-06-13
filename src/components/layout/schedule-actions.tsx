'use client'

import { CalendarDots, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export function ScheduleAddButton() {
  return (
    <Button>
      <Plus size={15} weight="bold" />
      Урок
    </Button>
  )
}

export function ScheduleAddButtonSmall() {
  return (
    <Button size="sm">
      <Plus size={13} weight="bold" />
      Запланировать урок
    </Button>
  )
}

export function ScheduleIcon() {
  return <CalendarDots size={22} />
}
