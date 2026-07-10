import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CyTag from '../../components/ui/CyTag'
import { usePostStore } from '../../store/postStore'
import type { PostType } from '../../types'

const TYPE_INFO: Record<PostType, { label: string; to: string; color: 'red' | 'cyan' }> = {
  DIARY: { label: '다이어리', to: '/diary', color: 'red' },
  PHOTO: { label: '사진첩', to: '/photo', color: 'cyan' },
  BOARD: { label: '게시판', to: '/board', color: 'cyan' },
}

export default function News() {
  const navigate = useNavigate()
  const lists = usePostStore((state) => state.lists)
  const { fetchPosts } = usePostStore()

  useEffect(() => {
    fetchPosts('DIARY', 1, 100)
    fetchPosts('BOARD', 1, 20)
    fetchPosts('PHOTO', 1, 60)
  }, [fetchPosts])

  // latest posts across all boards
  const recent = (['DIARY', 'BOARD', 'PHOTO'] as PostType[])
    .flatMap((type) => lists[type].posts.map((post) => ({ post, type })))
    .sort((a, b) => (b.post.createdAt ?? '').localeCompare(a.post.createdAt ?? ''))
    .slice(0, 4)

  return (
    <div className="w-[240px]">
      <div className="font-black text-xs text-cy-cyan">Updated News</div>
      <hr className="my-1 h-[1px] bg-cy-border border-none" />
      <div className="flex flex-col gap-0.5">
        {recent.length === 0 && (
          <p className="text-[8px] text-cy-text-muted">아직 새 소식이 없습니다.</p>
        )}
        {recent.map(({ post, type }) => (
          <div key={`${type}-${post.id}`} className="flex items-center gap-1.5">
            <CyTag label={TYPE_INFO[type].label} color={TYPE_INFO[type].color} />
            <div
              onClick={() => navigate(TYPE_INFO[type].to)}
              className="font-black text-[9px] cursor-pointer hover:underline truncate"
            >
              {post.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
