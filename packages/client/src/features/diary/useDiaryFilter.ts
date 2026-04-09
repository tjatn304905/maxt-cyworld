import { useMemo } from 'react'
import { useFuzzySearch } from '../../hooks/useFuzzySearch'
import type { DiaryEntry } from '../../types'

export function useDiaryFilter(
  data: DiaryEntry[],
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

  return useFuzzySearch(filteredByCategory, ['title', 'content', 'author'], query)
}
