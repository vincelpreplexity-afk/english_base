'use client'

import { useEffect } from 'react'

/**
 * Locks background scroll while a modal/overlay is mounted.
 * Call it unconditionally inside a component that is only rendered when open;
 * it restores the previous overflow value on unmount.
 */
export function useScrollLock(active = true) {
  useEffect(() => {
    if (!active) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [active])
}
