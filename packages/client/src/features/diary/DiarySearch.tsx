import { Search } from 'lucide-react'
import CyInput from '../../components/ui/CyInput'
import CyButton from '../../components/ui/CyButton'
import { CATEGORIES } from './data'

interface DiarySearchProps {
  query: string
  onQueryChange: (query: string) => void
  categoryFilter: string
  onCategoryChange: (category: string) => void
}

export default function DiarySearch({ query, onQueryChange, categoryFilter, onCategoryChange }: DiarySearchProps) {
  return (
    <div className="w-full flex gap-1.5 mb-1.5 items-center">
      <CyInput
        icon={<Search size={10} />}
        placeholder="검색어를 입력하세요..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      <div className="flex gap-0.5">
        {CATEGORIES.map((cat) => (
          <CyButton
            key={cat}
            size="sm"
            variant={categoryFilter === cat ? 'active' : 'default'}
            onClick={() => onCategoryChange(cat)}
          >
            {cat === 'All' ? '전체' : cat}
          </CyButton>
        ))}
      </div>
    </div>
  )
}
