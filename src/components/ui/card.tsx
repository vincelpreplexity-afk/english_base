import { type HTMLAttributes } from 'react'

export function Card({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white border border-stone-200 rounded-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-5 py-4 border-b border-stone-200 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-5 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
