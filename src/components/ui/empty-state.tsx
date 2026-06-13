import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
      {icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-400">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-xs">
        <p className="text-sm font-medium text-stone-700">{title}</p>
        {description && (
          <p className="text-xs text-stone-500 leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
