import { Fragment, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import CyButton from '../../components/ui/CyButton'
import PostWriteModal from '../../components/shared/PostWriteModal'
import BoardPost from './BoardPost'
import { useBoard } from './useBoard'
import { useRole } from '../../hooks/useRole'

const BOARD_CATEGORIES = ['Free', 'Notice']

function isToday(dateStr: string): boolean {
  return dateStr?.slice(0, 10) === new Date().toISOString().slice(0, 10)
}

export default function BoardPage() {
  const {
    posts,
    total,
    page,
    limit,
    isLoading,
    error,
    expandedPost,
    animatingHearts,
    handleLike,
    toggleExpand,
    goToPage,
  } = useBoard()
  const { canWrite } = useRole()
  const [writing, setWriting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className='flex flex-col px-4 h-full overflow-y-auto scrollbar-hide'>
      <PageHeader
        title='Board'
        subtitle='Community'
        action={canWrite ? { label: '✏️ 글쓰기', onClick: () => setWriting(true) } : undefined}
      />

      {error && <p className='text-[8px] text-cy-tag-red px-1 pb-1'>{error}</p>}

      <table className='cy-post-table'>
        <thead>
          <tr>
            <th className='w-7'>번호</th>
            <th>제목</th>
            <th className='w-14'>작성자</th>
            <th className='w-16'>날짜</th>
            <th className='w-8'>♥</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 && !isLoading && (
            <tr>
              <td colSpan={5} className='!py-4 text-cy-text-muted'>아직 게시물이 없습니다.</td>
            </tr>
          )}
          {posts.map((post, idx) => (
            <Fragment key={post.id}>
              <tr onClick={() => toggleExpand(post.id)}>
                <td className='text-cy-text-muted'>{total - ((page - 1) * limit + idx)}</td>
                <td className='cy-post-title'>
                  {post.title}
                  {post.commentCount > 0 && (
                    <span className='text-cy-cyan-dark ml-1'>[{post.commentCount}]</span>
                  )}
                  {isToday(post.createdAt) && <span className='cy-badge-new'>N</span>}
                </td>
                <td>{post.author?.nickname ?? '알 수 없음'}</td>
                <td className='text-cy-text-muted'>{post.eventDate?.slice(0, 10)}</td>
                <td>{post.likeCount}</td>
              </tr>
              {expandedPost === post.id && (
                <tr className='!cursor-default'>
                  <td colSpan={5} className='!p-1.5 !text-left'>
                    <BoardPost
                      post={post}
                      isAnimating={animatingHearts.has(post.id)}
                      onLike={handleLike}
                    />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-1 py-2'>
          <CyButton size='sm' disabled={page <= 1} onClick={() => goToPage(page - 1)}>◀</CyButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <CyButton
              key={p}
              size='sm'
              variant={p === page ? 'active' : 'default'}
              onClick={() => goToPage(p)}
            >
              {p}
            </CyButton>
          ))}
          <CyButton size='sm' disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>▶</CyButton>
        </div>
      )}

      {writing && (
        <PostWriteModal
          postType='BOARD'
          categories={BOARD_CATEGORIES}
          onClose={() => setWriting(false)}
        />
      )}
    </div>
  )
}
