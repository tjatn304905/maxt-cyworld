import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import type { HistoryPost } from '../../types'
import type { PostDetail } from '../../services/posts'
import { getPost } from '../../services/posts'
import { usePostStore } from '../../store/postStore'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import CyModal from '../../components/ui/CyModal'
import CyButton from '../../components/ui/CyButton'
import DashedDivider from '../../components/ui/DashedDivider'
import CommentThread from '../../components/shared/CommentThread'
import PostWriteModal from '../../components/shared/PostWriteModal'

interface LightboxProps {
  photo: HistoryPost
  fallback: { color: string; emoji: string }
  onClose: () => void
}

export default function Lightbox({ photo, fallback, onClose }: LightboxProps) {
  const user = useAuthStore((state) => state.user)
  const { isAdmin } = useRole()
  const liked = usePostStore((state) => state.likedByPost[photo.id]) ?? false
  const { toggleLike, fetchLikeStatus, deletePost } = usePostStore()

  const [detail, setDetail] = useState<PostDetail | null>(null)
  const [editing, setEditing] = useState(false)

  const isOwner = photo.author?.id === user?.id
  const canManage = isOwner || isAdmin

  useEffect(() => {
    fetchLikeStatus(photo.id)
    getPost(photo.id).then(setDetail).catch(() => setDetail(null))
  }, [photo.id, photo.updatedAt, fetchLikeStatus])

  const handleDelete = async () => {
    if (!window.confirm('사진을 삭제할까요?')) return
    await deletePost(photo.id, 'PHOTO')
    onClose()
  }

  const images = detail?.images ?? []

  return (
    <CyModal title={`PHOTO · ${photo.eventDate?.slice(0, 10) ?? ''}`} onClose={onClose}>
      {images.length > 0 ? (
        <div className='flex flex-col gap-1.5'>
          {images.map((img) => (
            <img
              key={img.id}
              src={img.imageUrl}
              alt={photo.title}
              className='w-full rounded-sm border border-cy-border-light'
            />
          ))}
        </div>
      ) : (
        <div
          className='aspect-video rounded-md flex items-center justify-center pixel-render'
          style={{ backgroundColor: fallback.color }}
        >
          <span className='text-[48px]'>{fallback.emoji}</span>
        </div>
      )}

      <h3 className='text-[11px] font-bold mt-2'>{photo.title}</h3>
      <p className='text-[9px] text-cy-text-light mt-1 whitespace-pre-wrap'>{photo.content}</p>
      <p className='text-[8px] text-cy-text-muted mt-1'>
        📅 {photo.eventDate?.slice(0, 10)} · ✍️ {photo.author?.nickname ?? '알 수 없음'}
      </p>

      <div className='flex items-center gap-2 mt-2'>
        <button
          onClick={() => toggleLike(photo.id, 'PHOTO')}
          className='flex items-center gap-0.5 text-[9px] text-cy-text-light hover:text-red-400 transition-colors cursor-pointer'
        >
          <Heart size={11} className={liked ? 'fill-red-300 text-red-400' : ''} />
          <span>{photo.likeCount}</span>
        </button>
        {canManage && (
          <>
            {isOwner && <CyButton size='sm' onClick={() => setEditing(true)}>수정</CyButton>}
            <CyButton size='sm' onClick={handleDelete}>삭제</CyButton>
          </>
        )}
      </div>

      <DashedDivider />
      <CommentThread postId={photo.id} postType='PHOTO' />

      {editing && (
        <PostWriteModal
          postType='PHOTO'
          categories={['Photo']}
          editing={detail}
          requireImage
          onClose={() => setEditing(false)}
        />
      )}
    </CyModal>
  )
}
