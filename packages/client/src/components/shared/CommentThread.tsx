import { useEffect, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import type { Comment } from '../../types'
import { usePostStore } from '../../store/postStore'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'
import PixelAvatar, { avatarConfigFromRenderKeys } from '../ui/PixelAvatar'
import CySpinner from '../ui/CySpinner'

interface CommentThreadProps {
  postId: number
}

function authorName(comment: Comment): string {
  if (typeof comment.author === 'string') return comment.author
  return comment.author?.nickname || comment.author?.name || '알 수 없음'
}

function authorAvatarConfig(comment: Comment) {
  if (typeof comment.author === 'string') return {}
  return avatarConfigFromRenderKeys(comment.author?.avatarKeys ?? [])
}

function formatDate(value?: string): string {
  if (!value) return ''
  return value.slice(0, 10)
}

export default function CommentThread({ postId }: CommentThreadProps) {
  const user = useAuthStore((state) => state.user)
  const { isAdmin } = useRole()
  // undefined until the first fetch resolves → distinguishes loading from "no comments"
  const commentsRaw = usePostStore((state) => state.commentsByPost[postId])
  const comments = commentsRaw ?? []
  const isLoaded = commentsRaw !== undefined
  const { fetchComments, addComment, updateComment, deleteComment } = usePostStore()

  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    fetchComments(postId)
  }, [postId, fetchComments])

  const topLevel = comments.filter((c) => c.parentId === null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isBusy) return
    setIsBusy(true)
    try {
      await addComment(postId, newComment.trim())
      setNewComment('')
    } finally {
      setIsBusy(false)
    }
  }

  const handleReply = async (e: FormEvent, parentId: number) => {
    e.preventDefault()
    if (!replyText.trim() || isBusy) return
    setIsBusy(true)
    try {
      await addComment(postId, replyText.trim(), parentId)
      setReplyText('')
      setReplyTo(null)
    } finally {
      setIsBusy(false)
    }
  }

  const handleEdit = async (e: FormEvent, commentId: number) => {
    e.preventDefault()
    if (!editText.trim() || isBusy) return
    setIsBusy(true)
    try {
      await updateComment(postId, commentId, editText.trim())
      setEditingId(null)
      setEditText('')
    } finally {
      setIsBusy(false)
    }
  }

  const handleDelete = async (commentId: number) => {
    if (isBusy) return
    if (!window.confirm('댓글을 삭제할까요?')) return
    setIsBusy(true)
    try {
      await deleteComment(postId, commentId)
    } finally {
      setIsBusy(false)
    }
  }

  const renderComment = (comment: Comment, isReply: boolean) => {
    const mine = comment.userId != null && comment.userId === user?.id
    const canDelete = mine || isAdmin

    if (editingId === comment.id) {
      return (
        <form
          key={comment.id}
          onSubmit={(e) => handleEdit(e, comment.id)}
          className={`cy-comment-row ${isReply ? 'cy-comment-reply' : ''}`}
        >
          <input
            type='text'
            value={editText}
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
      <div key={comment.id} className={`cy-comment-row !items-center ${isReply ? 'cy-comment-reply' : ''}`}>
        <span className='shrink-0 bg-cy-pastel-blue rounded-sm border border-cy-border-light overflow-hidden'>
          <PixelAvatar size={18} {...authorAvatarConfig(comment)} />
        </span>
        <span className='cy-comment-author'>{authorName(comment)}</span>
        <span className='flex-1 text-cy-text'>{comment.content}</span>
        <span className='text-[7px] text-cy-text-muted whitespace-nowrap'>
          ({formatDate(comment.createdAt)})
        </span>
        {!isReply && (
          <button
            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            className='text-[7px] text-cy-text-muted hover:text-cy-cyan cursor-pointer whitespace-nowrap'
          >
            답글
          </button>
        )}
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
    <div className='p-2'>
      {!isLoaded && (
        <CySpinner label='일촌평 불러오는 중' className='w-full justify-center py-1' />
      )}
      {isLoaded && topLevel.length === 0 && (
        <p className='text-[8px] text-cy-text-muted text-center py-1'>첫 번째 일촌평을 남겨보세요!</p>
      )}

      {topLevel.map((comment) => {
        const replies = comments.filter((c) => c.parentId === comment.id)
        return (
          <div key={comment.id}>
            {renderComment(comment, false)}
            {replies.map((reply) => renderComment(reply, true))}
            {replyTo === comment.id && (
              <form onSubmit={(e) => handleReply(e, comment.id)} className='ml-4 mt-1 mb-1 flex gap-1'>
                <input
                  type='text'
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder='답글을 입력하세요...'
                  className='flex-1 text-[9px] border border-cy-border-light rounded-md px-1.5 py-0.5 outline-none focus:border-cy-cyan font-[inherit]'
                  autoFocus
                />
                <button type='submit' className='cy-btn !p-1' disabled={isBusy}>
                  <Send size={10} />
                </button>
              </form>
            )}
          </div>
        )
      })}

      <form onSubmit={handleSubmit} className='flex gap-1 pt-1.5 mt-1'>
        <input
          type='text'
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder='일촌평을 입력하세요...'
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
