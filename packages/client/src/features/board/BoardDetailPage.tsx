import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { usePostStore } from '../../store/postStore'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import { toDisplayHtml } from '../../utils/postHtml'
import PageHeader from '../../components/ui/PageHeader'
import CyButton from '../../components/ui/CyButton'
import CyTag from '../../components/ui/CyTag'
import DashedDivider from '../../components/ui/DashedDivider'
import CommentThread from '../../components/shared/CommentThread'
import CyLoader from '../../components/ui/CyLoader'

export default function BoardDetailPage() {
  const { id } = useParams()
  const postId = Number(id)
  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user)
  const { isAdmin } = useRole()
  const { currentPost, isLoading, error, fetchPost, fetchLikeStatus, toggleLike, deletePost } =
    usePostStore()
  const liked = usePostStore((state) => state.likedByPost[postId]) ?? false
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!Number.isNaN(postId)) {
      fetchPost(postId)
      fetchLikeStatus(postId)
    }
  }, [postId, fetchPost, fetchLikeStatus])

  if (isLoading && !currentPost) {
    return <CyLoader message='게시물을 불러오는 중' />
  }

  if (!currentPost || currentPost.id !== postId) {
    return (
      <div className='flex flex-col items-center py-8 gap-2'>
        <p className='text-[9px] text-cy-text-muted'>{error ?? '게시물을 찾을 수 없습니다.'}</p>
        <CyButton size='sm' onClick={() => navigate('/board')}>목록으로</CyButton>
      </div>
    )
  }

  const post = currentPost
  const isOwner = post.author?.id === user?.id
  const canManage = isOwner || isAdmin

  const handleDelete = async () => {
    if (isDeleting) return
    if (!window.confirm('게시물을 삭제할까요?')) return
    setIsDeleting(true)
    try {
      await deletePost(post.id)
      navigate('/board')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className='flex flex-col px-4 h-full overflow-y-auto scrollbar-hide'>
      <PageHeader title='Board' subtitle='Team History' />

      {/* post header */}
      <div className='cy-panel !bg-white'>
        <div className='flex items-center gap-1.5'>
          <CyTag label={post.category} color='cyan' />
          <h1 className='text-[12px] font-bold flex-1'>{post.title}</h1>
        </div>
        <p className='text-[8px] text-cy-text-muted mt-1'>
          ✍️ {post.author?.nickname ?? '알 수 없음'} · 📅 {post.eventDate?.slice(0, 10)} · ♥ {post.likeCount} · 💬 {post.commentCount}
        </p>
      </div>

      {/* post body (sanitized rich text) */}
      <div
        className='cy-post-body py-3 px-1'
        dangerouslySetInnerHTML={{ __html: toDisplayHtml(post.content) }}
      />

      <div className='flex items-center justify-between py-1'>
        <button
          onClick={() => toggleLike(post.id)}
          className='flex items-center gap-1 text-[9px] text-cy-text-light hover:text-red-400 transition-colors cursor-pointer'
        >
          <Heart size={12} className={liked ? 'fill-red-300 text-red-400' : ''} />
          <span>좋아요 {post.likeCount}</span>
        </button>
        <div className='flex gap-1'>
          {canManage && (
            <CyButton size='sm' onClick={() => navigate(`/board/${post.id}/edit`)}>수정</CyButton>
          )}
          {canManage && (
            <CyButton size='sm' onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? '삭제 중...' : '삭제'}
            </CyButton>
          )}
          <CyButton size='sm' onClick={() => navigate('/board')}>목록으로</CyButton>
        </div>
      </div>

      <DashedDivider />
      <CommentThread postId={post.id} />
    </div>
  )
}
