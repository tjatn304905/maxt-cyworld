import { Heart, MessageCircle } from 'lucide-react'
import type { BoardPost as BoardPostType, Comment } from '../../types'
import CommentSection from './CommentSection'

interface BoardPostProps {
  post: BoardPostType
  comments: Comment[]
  isExpanded: boolean
  isAnimating: boolean
  onLike: (postId: number) => void
  onToggle: (postId: number) => void
  onAddComment: (postId: number, content: string, parentId?: number | null) => void
}

export default function BoardPost({
  post,
  comments,
  isExpanded,
  isAnimating,
  onLike,
  onToggle,
  onAddComment,
}: BoardPostProps) {
  return (
    <div className="bg-white border-[1.5px] border-[#DDDDDD] rounded-md overflow-hidden mb-2 w-full">
      <div className="p-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[10px] font-bold">{post.title}</h3>
            <div className="text-[8px] text-cy-text-light mt-0.5">
              {post.author} · {post.date}
            </div>
          </div>
        </div>
        <p className="text-[9px] mt-1 leading-relaxed">{post.content}</p>

        <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-[#DDDDDD]">
          <button
            onClick={() => onLike(post.id)}
            className="flex items-center gap-0.5 text-[8px] text-cy-text-light hover:text-red-400 transition-colors cursor-pointer"
          >
            <Heart
              size={10}
              className={`${isAnimating ? 'heart-beat' : ''} ${post.likes > 0 ? 'fill-red-300 text-red-400' : ''}`}
            />
            <span>{post.likes}</span>
          </button>
          <button
            onClick={() => onToggle(post.id)}
            className="flex items-center gap-0.5 text-[8px] text-cy-text-muted hover:text-cy-cyan transition-colors cursor-pointer"
          >
            <MessageCircle size={10} />
            <span>댓글 {comments.length}</span>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t-[1.5px] border-[#DDDDDD] bg-[#fafafa]">
          <CommentSection
            comments={comments}
            postId={post.id}
            onAddComment={onAddComment}
          />
        </div>
      )}
    </div>
  )
}
