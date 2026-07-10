import { useEffect, useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import type { Comment, PostType } from '../../types'
import { usePostStore } from '../../store/postStore'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'

interface CommentThreadProps {
  postId: number
  postType: PostType
}

function authorName(comment: Comment): string {
  if (typeof comment.author === 'string') return comment.author
  return comment.author?.nickname || comment.author?.name || '알 수 없음'
}

function formatDate(value?: string): string {
  if (!value) return ''
  return value.slice(0, 10)
}

export default function CommentThread({ postId, postType }: CommentThreadProps) {
  const user = useAuthStore((state) => state.user)
  const { isAdmin } = useRole()
  const comments = usePostStore((state) => state.commentsByPost[postId]) ?? []
  const { fetchComments, addComment, updateComment, deleteComment } = usePostStore()

  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    fetchComments(postId)
  }, [postId, fetchComments])

  const topLevel = comments.filter((c) => c.parentId === null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    await addComment(postId, postType, newComment.trim())
    setNewComment('')
  }

  const handleReply = async (e: FormEvent, parentId: number) => {
    e.preventDefault()
    if (!replyText.trim()) return
    await addComment(postId, postType, replyText.trim(), parentId)
    setReplyText('')
    setReplyTo(null)
  }

  const handleEdit = async (e: FormEvent, commentId: number) => {
    e.preventDefault()
    if (!editText.trim()) return
    await updateComment(postId, commentId, editText.trim())
    setEditingId(null)
    setEditText('')
  }

  const handleDelete = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제할까요?')) return
    await deleteComment(postId, postType, commentId)
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
          <button type='submit' className='cy-btn !text-[8px]'>저장</button>
          <button type='button' className='cy-btn !text-[8px]' onClick={() => setEditingId(null)}>취소</button>
        </form>
      )
    }

    return (
      <div key={comment.id} className={`cy-comment-row ${isReply ? 'cy-comment-reply' : ''}`}>
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
            className='text-[7px] text-cy-text-muted hover:text-cy-tag-red cursor-pointer whitespace-nowrap'
          >
            삭제
          </button>
        )}
      </div>
    )
  }

  return (
    <div className='p-2'>
      {topLevel.length === 0 && (
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
                <button type='submit' className='cy-btn !p-1'>
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
        <button type='submit' className='cy-btn flex items-center gap-0.5 !text-[8px]'>
          <Send size={8} />
          등록
        </button>
      </form>
    </div>
  )
}
