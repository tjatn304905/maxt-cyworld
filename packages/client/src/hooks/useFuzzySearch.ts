import { useMemo } from 'react'
import Fuse from 'fuse.js'

export function useFuzzySearch<T>(items: T[], keys: string[], query: string): T[] {
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys,
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [items, keys]
  )

  const results = useMemo(() => {
    if (!query || query.trim() === '') return items
    return fuse.search(query).map((r) => r.item)
  }, [fuse, query, items])

  return results
}
