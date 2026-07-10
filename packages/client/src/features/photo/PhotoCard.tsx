import type { HistoryPost } from '../../types'

// fallback pastel + emoji when a post has no image
const FALLBACK_COLORS = ['#ffcccc', '#cce5ff', '#ccffcc', '#ffddaa', '#99ffcc', '#ffccff']
const FALLBACK_EMOJIS = ['📸', '🎉', '🏖️', '🏆', '⛺', '🎄']

interface PhotoCardProps {
  photo: HistoryPost
  index: number
  onSelect: () => void
}

export default function PhotoCard({ photo, index, onSelect }: PhotoCardProps) {
  return (
    <button onClick={onSelect} className='cy-photo-frame group'>
      {photo.representativeImage ? (
        <img
          src={photo.representativeImage}
          alt={photo.title}
          className='aspect-square w-full object-cover rounded-sm'
        />
      ) : (
        <div
          className='aspect-square rounded-sm flex items-center justify-center pixel-render'
          style={{ backgroundColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}
        >
          <span className='text-[24px]'>{FALLBACK_EMOJIS[index % FALLBACK_EMOJIS.length]}</span>
        </div>
      )}
      <div className='mt-1 text-center'>
        <div className='text-[9px] font-bold truncate'>{photo.title}</div>
        <div className='text-[7px] text-cy-text-light'>
          {photo.eventDate?.slice(0, 10)} · ♥ {photo.likeCount} · 💬 {photo.commentCount}
        </div>
      </div>
    </button>
  )
}
