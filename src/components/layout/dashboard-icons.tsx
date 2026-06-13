'use client'

import { CalendarDots, ListChecks, Lightning } from '@phosphor-icons/react'

export function DashboardTodayHeader() {
  return (
    <div className="flex items-center gap-2 text-stone-700">
      <CalendarDots size={16} weight="fill" className="text-accent" />
      <span className="text-sm font-medium">Сегодня</span>
    </div>
  )
}

export function DashboardTasksHeader() {
  return (
    <div className="flex items-center gap-2 text-stone-700">
      <ListChecks size={16} weight="fill" className="text-accent" />
      <span className="text-sm font-medium">Задачи</span>
    </div>
  )
}

export function DashboardActionsHeader() {
  return (
    <div className="flex items-center gap-2 text-stone-700">
      <Lightning size={16} weight="fill" className="text-accent" />
      <span className="text-sm font-medium">Быстрые действия</span>
    </div>
  )
}
