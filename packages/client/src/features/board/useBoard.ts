import { useCallback, useEffect, useState } from 'react'
import { usePostStore } from '../../store/postStore'

// UI state + BOARD-type slice of postStore
export function useBoard() {
  const list = usePostStore((state) => state.lists.BOARD)
  const isLoading = usePostStore((state) => state.isLoading)
  const error = usePostStore((state) => state.error)
  const { fetchPosts, toggleLike, fetchLikeStatus } = usePostStore()

  const [expandedPost, setExpandedPost] = useState<number | null>(null)
  const [animatingHearts, setAnimatingHearts] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchPosts('BOARD')
  }, [fetchPosts])

  const handleLike = useCallback(
    (postId: number) => {
      setAnimatingHearts((prev) => new Set([...prev, postId]))
      toggleLike(postId, 'BOARD')
      setTimeout(() => {
        setAnimatingHearts((prev) => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
      }, 400)
    },
    [toggleLike]
  )

  const toggleExpand = useCallback(
    (postId: number) => {
      const next = expandedPost === postId ? null : postId
      setExpandedPost(next)
      if (next != null) {
        fetchLikeStatus(next)
      }
    },
    [expandedPost, fetchLikeStatus]
  )

  const goToPage = useCallback(
    (page: number) => {
      setExpandedPost(null)
      fetchPosts('BOARD', page, list.limit)
    },
    [fetchPosts, list.limit]
  )

  return {
    posts: list.posts,
    total: list.total,
    page: list.page,
    limit: list.limit,
    isLoading,
    error,
    expandedPost,
    animatingHearts,
    handleLike,
    toggleExpand,
    goToPage,
  }
}
