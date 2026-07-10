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
import { DIARY_CATEGORIES } from './useDiaryFilter'

interface DiaryDetailProps {
  diary: HistoryPost
  onClose: () => void
}

export default function DiaryDetail({ diary, onClose }: DiaryDetailProps) {
  const user = useAuthStore((state) => state.user)
  const { isAdmin } = useRole()
  const liked = usePostStore((state) => state.likedByPost[diary.id]) ?? false
  const { toggleLike, fetchLikeStatus, deletePost } = usePostStore()

  const [detail, setDetail] = useState<PostDetail | null>(null)
  const [editing, setEditing] = useState(false)

  const isOwner = diary.author?.id === user?.id
  const canManage = isOwner || isAdmin

  useEffect(() => {
    fetchLikeStatus(diary.id)
    getPost(diary.id).then(setDetail).catch(() => setDetail(null))
  }, [diary.id, diary.updatedAt, fetchLikeStatus])

  const handleDelete = async () => {
    if (!window.confirm('다이어리를 삭제할까요?')) return
    await deletePost(diary.id, 'DIARY')
    onClose()
  }

  return (
    <CyModal title={diary.eventDate?.slice(0, 10) ?? 'DIARY'} onClose={onClose}>
      <div className='flex flex-col items-center'>
        <h1 className='font-bold text-[10px]'>제목 : {diary.title}</h1>
        <p className='text-[9px] text-cy-text-light mt-1.5 px-2 whitespace-pre-wrap self-stretch'>
          {diary.content}
        </p>
        {detail && detail.images.length > 0 && (
          <div className='flex flex-wrap gap-1.5 mt-2 justify-center'>
            {detail.images.map((img) => (
              <img
                key={img.id}
                src={img.imageUrl}
                alt={diary.title}
                className='max-w-[45%] rounded-sm border border-cy-border-light'
              />
            ))}
          </div>
        )}
        <p className='text-[8px] text-cy-text-muted mt-1.5'>
          ✍️ {diary.author?.nickname ?? '알 수 없음'}
        </p>

        <div className='flex items-center gap-2 mt-2'>
          <button
            onClick={() => toggleLike(diary.id, 'DIARY')}
            className='flex items-center gap-0.5 text-[9px] text-cy-text-light hover:text-red-400 transition-colors cursor-pointer'
          >
            <Heart size={11} className={liked ? 'fill-red-300 text-red-400' : ''} />
            <span>{diary.likeCount}</span>
          </button>
          {canManage && (
            <>
              {isOwner && <CyButton size='sm' onClick={() => setEditing(true)}>수정</CyButton>}
              <CyButton size='sm' onClick={handleDelete}>삭제</CyButton>
            </>
          )}
        </div>
      </div>

      <DashedDivider />
      <CommentThread postId={diary.id} postType='DIARY' />

      <div className='flex justify-center pt-1.5'>
        <CyButton onClick={onClose} size='sm'>목록으로</CyButton>
      </div>

      {editing && (
        <PostWriteModal
          postType='DIARY'
          categories={DIARY_CATEGORIES.filter((c) => c !== 'All')}
          editing={detail}
          onClose={() => setEditing(false)}
        />
      )}
    </CyModal>
  )
}
