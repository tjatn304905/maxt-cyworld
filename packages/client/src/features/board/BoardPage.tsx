import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import CyButton from '../../components/ui/CyButton'
import BookExportModal from '../book/BookExportModal'
import { usePostStore } from '../../store/postStore'
import { useRole } from '../../hooks/useRole'
import { BOARD_CATEGORIES } from './categories'

const FILTERS = ['All', ...BOARD_CATEGORIES]

function isToday(dateStr: string): boolean {
  return dateStr?.slice(0, 10) === new Date().toISOString().slice(0, 10)
}

export default function BoardPage() {
  const { posts, total, page, limit, category, isLoading, error, fetchPosts } = usePostStore()
  const { canWrite } = useRole()
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchPosts({ page: 1 })
  }, [fetchPosts])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const activeFilter = category ?? 'All'

  const handleFilter = (filter: string) => {
    fetchPosts({ page: 1, category: filter === 'All' ? null : filter })
  }

  return (
    <div className='flex flex-col px-4 h-full overflow-y-auto scrollbar-hide'>
      <PageHeader
        title='Board'
        subtitle='Team History'
        action={canWrite ? { label: '✏️ 글쓰기', onClick: () => navigate('/board/write') } : undefined}
      />

      <div className='flex gap-0.5 pb-1.5 flex-wrap items-center'>
        {FILTERS.map((filter) => (
          <CyButton
            key={filter}
            size='sm'
            variant={activeFilter === filter ? 'active' : 'default'}
            onClick={() => handleFilter(filter)}
          >
            {filter === 'All' ? '전체' : filter}
          </CyButton>
        ))}
        <span className='flex-1' />
        <CyButton size='sm' onClick={() => setExporting(true)}>📖 역사서 만들기</CyButton>
      </div>

      {error && <p className='text-[8px] text-cy-tag-red px-1 pb-1'>{error}</p>}

      <table className='cy-post-table'>
        <thead>
          <tr>
            <th className='w-7'>번호</th>
            <th>제목</th>
            <th className='w-16'>카테고리</th>
            <th className='w-14'>작성자</th>
            <th className='w-16'>날짜</th>
            <th className='w-8'>♥</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 && !isLoading && (
            <tr>
              <td colSpan={6} className='!py-4 text-cy-text-muted'>아직 게시물이 없습니다.</td>
            </tr>
          )}
          {posts.map((post, idx) => (
            <tr key={post.id} onClick={() => navigate(`/board/${post.id}`)}>
              <td className='text-cy-text-muted'>{total - ((page - 1) * limit + idx)}</td>
              <td className='cy-post-title'>
                {post.title}
                {post.commentCount > 0 && (
                  <span className='text-cy-cyan-dark ml-1'>[{post.commentCount}]</span>
                )}
                {isToday(post.createdAt) && <span className='cy-badge-new'>N</span>}
              </td>
              <td className='text-cy-text-muted'>{post.category}</td>
              <td>{post.author?.nickname ?? '알 수 없음'}</td>
              <td className='text-cy-text-muted'>{post.eventDate?.slice(0, 10)}</td>
              <td>{post.likeCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {exporting && <BookExportModal onClose={() => setExporting(false)} />}

      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-1 py-2'>
          <CyButton size='sm' disabled={page <= 1} onClick={() => fetchPosts({ page: page - 1 })}>◀</CyButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <CyButton
              key={p}
              size='sm'
              variant={p === page ? 'active' : 'default'}
              onClick={() => fetchPosts({ page: p })}
            >
              {p}
            </CyButton>
          ))}
          <CyButton size='sm' disabled={page >= totalPages} onClick={() => fetchPosts({ page: page + 1 })}>▶</CyButton>
        </div>
      )}
    </div>
  )
}
