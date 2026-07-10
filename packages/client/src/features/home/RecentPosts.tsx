import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CyTag from '../../components/ui/CyTag'
import { usePostStore } from '../../store/postStore'

// 홈 메인 위젯: 최근 게시글 (팀 히스토리 중심)
export default function RecentPosts() {
  const navigate = useNavigate()
  const posts = usePostStore((state) => state.posts)
  const { fetchPosts } = usePostStore()

  useEffect(() => {
    fetchPosts({ page: 1, category: null })
  }, [fetchPosts])

  const recent = [...posts]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 6)

  return (
    <div className='flex-1 min-w-0'>
      <div className='font-black text-xs text-cy-cyan'>최근 이야기</div>
      <hr className='my-1 h-[1px] bg-cy-border border-none' />
      <div className='flex flex-col'>
        {recent.length === 0 && (
          <p className='text-[8px] text-cy-text-muted py-2'>아직 기록된 이야기가 없습니다.</p>
        )}
        {recent.map((post) => (
          <div
            key={post.id}
            onClick={() => navigate(`/board/${post.id}`)}
            className='flex items-center gap-2 py-1 border-b-[1.5px] border-dotted border-cy-border-light cursor-pointer group'
          >
            {post.representativeImage ? (
              <img
                src={post.representativeImage}
                alt={post.title}
                className='w-8 h-8 object-cover rounded-sm border border-cy-border-light shrink-0'
              />
            ) : (
              <div className='w-8 h-8 rounded-sm bg-cy-pastel-blue border border-cy-border-light flex items-center justify-center text-[12px] shrink-0'>
                📖
              </div>
            )}
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-1'>
                <CyTag label={post.category} color='cyan' />
                <p className='font-black text-[9px] truncate group-hover:text-cy-cyan group-hover:underline'>
                  {post.title}
                </p>
              </div>
              <p className='text-[7px] text-cy-text-muted mt-0.5'>
                {post.eventDate?.slice(0, 10)} · ✍️ {post.author?.nickname ?? '알 수 없음'} · ♥ {post.likeCount} · 💬 {post.commentCount}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
