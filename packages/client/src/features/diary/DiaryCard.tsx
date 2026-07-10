import type { HistoryPost } from '../../types'

interface DiaryCardProps {
  diary: HistoryPost
  onClick: () => void
}

export default function DiaryCard({ diary, onClick }: DiaryCardProps) {
  const dateStr = diary.eventDate?.slice(0, 10) ?? ''
  const categoryClass = `category-${diary.category.toLowerCase()}`

  return (
    <div className='diary-card' onClick={onClick}>
      <div className='flex flex-col'>
        <div className='flex items-center gap-1'>
          <span className='diary-card-date'>{dateStr}</span>
          <span className={`cy-tag !text-[7px] !text-cy-text !bg-transparent border ${categoryClass}`}>
            {diary.category}
          </span>
        </div>
        <p className='diary-card-title'>제목: {diary.title}</p>
        <p className='text-[8px] text-cy-text-muted mt-0.5'>
          ✍️ {diary.author?.nickname ?? '알 수 없음'} · ♥ {diary.likeCount} · 💬 {diary.commentCount}
        </p>
      </div>
      <span className='diary-card-link'>
        자세히 보러 가기 {'>'}
      </span>
    </div>
  )
}
