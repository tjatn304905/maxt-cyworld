import { useEffect, useRef, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import CyButton from '../../components/ui/CyButton'
import PostWriteModal from '../../components/shared/PostWriteModal'
import DiarySearch from './DiarySearch'
import DiaryDetail from './DiaryDetail'
import DiaryCard from './DiaryCard'
import { useDiaryFilter, DIARY_CATEGORIES } from './useDiaryFilter'
import { usePostStore } from '../../store/postStore'
import { useRole } from '../../hooks/useRole'

export default function DiaryPage() {
  const list = usePostStore((state) => state.lists.DIARY)
  const { fetchPosts } = usePostStore()
  const { canWrite } = useRole()

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [writing, setWriting] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPosts('DIARY', 1, 100)
  }, [fetchPosts])

  const results = useDiaryFilter(list.posts, categoryFilter, query)
  const selectedDiary = selectedId ? list.posts.find((d) => d.id === selectedId) ?? null : null

  const handlePdfExport = async () => {
    if (!listRef.current) return
    const { default: html2canvas } = await import('html2canvas')
    const { jsPDF } = await import('jspdf')
    const canvas = await html2canvas(listRef.current, { scale: 2, backgroundColor: '#fff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const w = pdf.internal.pageSize.getWidth()
    const h = (canvas.height * w) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, w, h)
    pdf.save('Team_Annual_Report.pdf')
  }

  return (
    <div className='flex flex-col items-center justify-center px-4 h-full overflow-hidden'>
      <PageHeader
        title='Diary'
        subtitle='Today Story'
        action={{ label: 'PDF 내보내기', onClick: handlePdfExport }}
      />

      <div className='w-full flex items-center gap-1.5'>
        <div className='flex-1'>
          <DiarySearch
            query={query}
            onQueryChange={setQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
        </div>
        {canWrite && (
          <CyButton size='sm' className='mb-1.5' onClick={() => setWriting(true)}>
            ✏️ 일기쓰기
          </CyButton>
        )}
      </div>

      <div ref={listRef} className='h-full w-full overflow-y-scroll scrollbar-hide'>
        {results.length === 0 ? (
          <div className='text-center py-8 text-cy-text-muted text-sm'>
            검색 결과가 없습니다
          </div>
        ) : (
          results.map((diary) => (
            <DiaryCard
              key={diary.id}
              diary={diary}
              onClick={() => setSelectedId(diary.id)}
            />
          ))
        )}
      </div>

      {selectedDiary && (
        <DiaryDetail diary={selectedDiary} onClose={() => setSelectedId(null)} />
      )}

      {writing && (
        <PostWriteModal
          postType='DIARY'
          categories={DIARY_CATEGORIES.filter((c) => c !== 'All')}
          onClose={() => setWriting(false)}
        />
      )}
    </div>
  )
}
