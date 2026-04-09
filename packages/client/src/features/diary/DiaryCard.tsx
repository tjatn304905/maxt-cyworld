import type { DiaryEntry } from '../../types'

interface DiaryCardProps {
  diary: DiaryEntry
  onClick: () => void
}

export default function DiaryCard({ diary, onClick }: DiaryCardProps) {
  const date = new Date(diary.date)
  const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

  return (
    <div className="diary-card" onClick={onClick}>
      <div className="flex flex-col">
        <span className="diary-card-date">{dateStr}</span>
        <p className="diary-card-title">제목: {diary.title}</p>
      </div>
      <span className="diary-card-link">
        자세히 보러 가기 {'>'}
      </span>
    </div>
  )
}
