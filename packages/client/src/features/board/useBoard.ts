import { useState, useCallback } from 'react'
import type { BoardPost, Comment } from '../../types'
import { INITIAL_POSTS, INITIAL_COMMENTS } from './data'

export function useBoard() {
  const [posts, setPosts] = useState<BoardPost[]>(INITIAL_POSTS)
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [expandedPost, setExpandedPost] = useState<number | null>(null)
  const [animatingHearts, setAnimatingHearts] = useState<Set<number>>(new Set())

  const handleLike = useCallback((postId: number) => {
    setAnimatingHearts((prev) => new Set([...prev, postId]))
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    )
    setTimeout(() => {
      setAnimatingHearts((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
    }, 400)
  }, [])

  const handleAddComment = useCallback(
    (postId: number, content: string, parentId: number | null = null) => {
      const newComment: Comment = {
        id: Date.now(),
        postId,
        parentId,
        author: '나',
        content,
        date: new Date().toISOString().slice(0, 10),
      }
      setComments((prev) => [...prev, newComment])
    },
    []
  )

  const toggleExpand = useCallback(
    (postId: number) => {
      setExpandedPost(expandedPost === postId ? null : postId)
    },
    [expandedPost]
  )

  return {
    posts,
    comments,
    expandedPost,
    animatingHearts,
    handleLike,
    handleAddComment,
    toggleExpand,
  }
}
