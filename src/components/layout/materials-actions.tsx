'use client'

import { BookOpen, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export function MaterialsAddButton() {
  return (
    <Button>
      <Plus size={15} weight="bold" />
      Добавить
    </Button>
  )
}

export function MaterialsAddButtonSmall() {
  return (
    <Button size="sm">
      <Plus size={13} weight="bold" />
      Добавить материал
    </Button>
  )
}

export function MaterialsIcon() {
  return <BookOpen size={22} />
}
