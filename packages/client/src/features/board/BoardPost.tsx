import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import type { HistoryPost } from '../../types'
import type { PostDetail } from '../../services/posts'
import { getPost } from '../../services/posts'
import { usePostStore } from '../../store/postStore'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import CommentThread from '../../components/shared/CommentThread'
import PostWriteModal from '../../components/shared/PostWriteModal'
import CyButton from '../../components/ui/CyButton'
import DashedDivider from '../../components/ui/DashedDivider'

interface BoardPostProps {
  post: HistoryPost
  isAnimating: boolean
  onLike: (postId: number) => void
}

// expanded row detail: content + images + like + comments + owner actions
export default function BoardPost({ post, isAnimating, onLike }: BoardPostProps) {
  const user = useAuthStore((state) => state.user)
  const { isAdmin } = useRole()
  const liked = usePostStore((state) => state.likedByPost[post.id]) ?? false
  const { deletePost } = usePostStore()

  const [detail, setDetail] = useState<PostDetail | null>(null)
  const [editing, setEditing] = useState(false)

  const isOwner = post.author?.id === user?.id
  const canManage = isOwner || isAdmin

  useEffect(() => {
    getPost(post.id).then(setDetail).catch(() => setDetail(null))
  }, [post.id, post.updatedAt])

  const handleDelete = async () => {
    if (!window.confirm('게시물을 삭제할까요?')) return
    await deletePost(post.id, 'BOARD')
  }

  return (
    <div className='cy-panel !bg-white'>
      <p className='text-[9px] leading-relaxed whitespace-pre-wrap'>{post.content}</p>

      {detail && detail.images.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mt-2'>
          {detail.images.map((img) => (
            <img
              key={img.id}
              src={img.imageUrl}
              alt={post.title}
              className='max-w-[45%] rounded-sm border border-cy-border-light'
            />
          ))}
        </div>
      )}

      <div className='flex items-center justify-between mt-2'>
        <button
          onClick={() => onLike(post.id)}
          className='flex items-center gap-0.5 text-[8px] text-cy-text-light hover:text-red-400 transition-colors cursor-pointer'
        >
          <Heart
            size={10}
            className={`${isAnimating ? 'heart-beat' : ''} ${liked || post.likeCount > 0 ? 'fill-red-300 text-red-400' : ''}`}
          />
          <span>{post.likeCount}</span>
        </button>
        {canManage && (
          <div className='flex gap-1'>
            {isOwner && (
              <CyButton size='sm' onClick={() => setEditing(true)}>수정</CyButton>
            )}
            <CyButton size='sm' onClick={handleDelete}>삭제</CyButton>
          </div>
        )}
      </div>

      <DashedDivider />
      <CommentThread postId={post.id} postType='BOARD' />

      {editing && (
        <PostWriteModal
          postType='BOARD'
          categories={['Free', 'Notice']}
          editing={detail}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  )
}
