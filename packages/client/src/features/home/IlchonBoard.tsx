import { useEffect, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import type { IlchonComment } from '../../types'
import { useIlchonStore } from '../../store/ilchonStore'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import PixelAvatar, { avatarConfigFromRenderKeys } from '../../components/ui/PixelAvatar'
import CySpinner from '../../components/ui/CySpinner'

const MAX_CONTENT_LENGTH = 100

function authorName(comment: IlchonComment): string {
  return comment.author?.nickname || comment.author?.name || '알 수 없음'
}

function formatDate(value?: string): string {
  if (!value) return ''
  return value.slice(0, 10)
}

// 홈 위젯: 일촌평 (미니홈피에 남기는 한 줄 평)
export default function IlchonBoard() {
  const user = useAuthStore((state) => state.user)
  const { isAdmin } = useRole()
  const { comments, isLoaded, fetchComments, addComment, updateComment, deleteComment } =
    useIlchonStore()

  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isBusy) return
    setIsBusy(true)
    try {
      await addComment(newComment.trim())
      setNewComment('')
    } finally {
      setIsBusy(false)
    }
  }

  const handleEdit = async (e: FormEvent, commentId: number) => {
    e.preventDefault()
    if (!editText.trim() || isBusy) return
    setIsBusy(true)
    try {
      await updateComment(commentId, editText.trim())
      setEditingId(null)
      setEditText('')
    } finally {
      setIsBusy(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    if (isBusy) return
    if (!window.confirm('일촌평을 삭제할까요?')) return
    setIsBusy(true)
    try {
      await deleteComment(commentId)
    } finally {
      setIsBusy(false)
    }
  }

  const renderComment = (comment: IlchonComment) => {
    const mine = comment.userId != null && comment.userId === user?.id
    const canDelete = mine || isAdmin

    if (editingId === comment.id) {
      return (
        <form
          key={comment.id}
          onSubmit={(e) => handleEdit(e, comment.id)}
          className='cy-comment-row'
        >
          <input
            type='text'
            value={editText}
            maxLength={MAX_CONTENT_LENGTH}
            onChange={(e) => setEditText(e.target.value)}
            className='flex-1 text-[9px] border border-cy-border-light rounded-md px-1.5 py-0.5 outline-none focus:border-cy-cyan font-[inherit]'
            autoFocus
          />
          <button type='submit' className='cy-btn !text-[8px]' disabled={isBusy}>
            {isBusy ? '저장 중...' : '저장'}
          </button>
          <button type='button' className='cy-btn !text-[8px]' onClick={() => setEditingId(null)}>취소</button>
        </form>
      )
    }

    return (
      <div key={comment.id} className='cy-comment-row !items-center'>
        <span className='shrink-0 bg-cy-pastel-blue rounded-sm border border-cy-border-light overflow-hidden'>
          <PixelAvatar size={18} {...avatarConfigFromRenderKeys(comment.author?.avatarKeys ?? [])} />
        </span>
        <span className='cy-comment-author'>{authorName(comment)}</span>
        <span className='flex-1 text-cy-text'>{comment.content}</span>
        <span className='text-[7px] text-cy-text-muted whitespace-nowrap'>
          ({formatDate(comment.createdAt)})
        </span>
        {mine && (
          <button
            onClick={() => {
              setEditingId(comment.id)
              setEditText(comment.content)
            }}
            className='text-[7px] text-cy-text-muted hover:text-cy-cyan cursor-pointer whitespace-nowrap'
          >
            수정
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => handleDelete(comment.id)}
            disabled={isBusy}
            className='text-[7px] text-cy-text-muted hover:text-cy-tag-red cursor-pointer whitespace-nowrap disabled:opacity-50'
          >
            삭제
          </button>
        )}
      </div>
    )
  }

  return (
    <div className='mb-4'>
      <div className='font-black text-xs text-cy-cyan'>일촌평</div>
      <hr className='my-1 h-[1px] bg-cy-border border-none' />

      {!isLoaded && (
        <CySpinner label='일촌평 불러오는 중' className='w-full justify-center py-1' />
      )}
      {isLoaded && comments.length === 0 && (
        <p className='text-[8px] text-cy-text-muted text-center py-1'>첫 번째 일촌평을 남겨보세요!</p>
      )}

      {comments.map((comment) => renderComment(comment))}

      <form onSubmit={handleSubmit} className='flex gap-1 pt-1.5 mt-1'>
        <input
          type='text'
          value={newComment}
          maxLength={MAX_CONTENT_LENGTH}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder='일촌평을 남겨보세요... (100자 이내)'
          className='flex-1 text-[9px] border-[1.5px] border-cy-border-light rounded-md px-1.5 py-1 outline-none focus:border-cy-cyan font-[inherit]'
        />
        <button type='submit' className='cy-btn flex items-center gap-0.5 !text-[8px]' disabled={isBusy}>
          <Send size={8} />
          {isBusy ? '등록 중...' : '등록'}
        </button>
      </form>
    </div>
  )
}
