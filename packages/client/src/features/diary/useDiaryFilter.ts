import { useMemo } from 'react'
import { useFuzzySearch } from '../../hooks/useFuzzySearch'
import type { HistoryPost } from '../../types'

export const DIARY_CATEGORIES = ['All', 'Event', 'Workshop', 'Meeting'] as const

export function useDiaryFilter(
  data: HistoryPost[],
  categoryFilter: string,
  query: string
) {
  const filteredByCategory = useMemo(
    () =>
      categoryFilter === 'All'
        ? data
        : data.filter((d) => d.category === categoryFilter),
    [data, categoryFilter]
  )

  return useFuzzySearch(filteredByCategory, ['title', 'content', 'author.nickname'], query)
}
