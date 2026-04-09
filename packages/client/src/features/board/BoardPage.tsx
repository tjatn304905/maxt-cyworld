import PageHeader from '../../components/ui/PageHeader'
import BoardPost from './BoardPost'
import { useBoard } from './useBoard'

export default function BoardPage() {
  const {
    posts,
    comments,
    expandedPost,
    animatingHearts,
    handleLike,
    handleAddComment,
    toggleExpand,
  } = useBoard()

  return (
    <div className="flex flex-col items-center px-4 h-full overflow-hidden">
      <PageHeader title="Board" subtitle="Community" />

      {posts.map((post) => {
        const postComments = comments.filter((c) => c.postId === post.id)
        return (
          <BoardPost
            key={post.id}
            post={post}
            comments={postComments}
            isExpanded={expandedPost === post.id}
            isAnimating={animatingHearts.has(post.id)}
            onLike={handleLike}
            onToggle={toggleExpand}
            onAddComment={handleAddComment}
          />
        )
      })}
    </div>
  )
}
