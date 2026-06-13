'use client'

import { GraduationCap, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export function StudentsAddButton() {
  return (
    <Button>
      <Plus size={15} weight="bold" />
      Добавить
    </Button>
  )
}

export function StudentsAddButtonSmall() {
  return (
    <Button size="sm">
      <Plus size={13} weight="bold" />
      Добавить ученика
    </Button>
  )
}

export function StudentsIcon() {
  return <GraduationCap size={22} />
}
