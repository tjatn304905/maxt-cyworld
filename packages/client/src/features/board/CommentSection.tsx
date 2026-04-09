import { useState, type FormEvent } from 'react'
import { Send, CornerDownRight } from 'lucide-react'
import type { Comment } from '../../types'

interface CommentSectionProps {
  comments: Comment[]
  postId: number
  onAddComment: (postId: number, content: string, parentId?: number | null) => void
}

export default function CommentSection({ comments, postId, onAddComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  const topLevel = comments.filter((c) => c.parentId === null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    onAddComment(postId, newComment.trim())
    setNewComment('')
  }

  const handleReply = (e: FormEvent, parentId: number) => {
    e.preventDefault()
    if (!replyText.trim()) return
    onAddComment(postId, replyText.trim(), parentId)
    setReplyText('')
    setReplyTo(null)
  }

  return (
    <div className="p-2 space-y-1.5">
      {topLevel.map((comment) => {
        const replies = comments.filter((c) => c.parentId === comment.id)
        return (
          <div key={comment.id}>
            <div className="bg-white border border-[#DDDDDD] rounded-md p-1.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-bold">{comment.author}</span>
                  <span className="text-[7px] text-cy-text-light ml-1.5">{comment.date}</span>
                </div>
                <button
                  onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                  className="text-[7px] text-cy-text-muted hover:text-cy-cyan cursor-pointer"
                >
                  답글
                </button>
              </div>
              <p className="text-[9px] mt-0.5">{comment.content}</p>
            </div>

            {replies.map((reply) => (
              <div key={reply.id} className="ml-4 mt-0.5">
                <div className="bg-[#f0f8ff] border border-[#DDDDDD] rounded-md p-1.5 flex items-start gap-1">
                  <CornerDownRight size={8} className="text-cy-text-light mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[9px] font-bold">{reply.author}</span>
                    <span className="text-[7px] text-cy-text-light ml-1.5">{reply.date}</span>
                    <p className="text-[9px] mt-0.5">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {replyTo === comment.id && (
              <form onSubmit={(e) => handleReply(e, comment.id)} className="ml-4 mt-0.5 flex gap-1">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="답글을 입력하세요..."
                  className="flex-1 text-[9px] border border-[#DDDDDD] rounded-md px-1.5 py-0.5 outline-none focus:border-cy-cyan font-[inherit]"
                  autoFocus
                />
                <button type="submit" className="cy-btn !p-1">
                  <Send size={10} />
                </button>
              </form>
            )}
          </div>
        )
      })}

      <form onSubmit={handleSubmit} className="flex gap-1 pt-1 border-t border-[#DDDDDD]">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          className="flex-1 text-[9px] border-[1.5px] border-[#DDDDDD] rounded-md px-1.5 py-1 outline-none focus:border-cy-cyan font-[inherit]"
        />
        <button type="submit" className="cy-btn flex items-center gap-0.5 !text-[8px]">
          <Send size={8} />
          등록
        </button>
      </form>
    </div>
  )
}
