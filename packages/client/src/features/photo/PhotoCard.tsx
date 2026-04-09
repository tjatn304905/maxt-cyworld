import type { PhotoItem } from '../../types'

interface PhotoCardProps {
  photo: PhotoItem
  emoji: string
  isSelected: boolean
  onSelect: () => void
}

export default function PhotoCard({ photo, emoji, isSelected, onSelect }: PhotoCardProps) {
  return (
    <button
      onClick={onSelect}
      className="group cursor-pointer"
    >
      <div className="bg-white border-[1.5px] border-[#DDDDDD] rounded-md p-1 shadow-sm hover:shadow-md transition-shadow hover:border-cy-cyan">
        <div
          className="aspect-square rounded flex items-center justify-center pixel-render"
          style={{ backgroundColor: photo.color }}
        >
          <span className="text-[24px]">{emoji}</span>
        </div>
        <div className="mt-1 text-center">
          <div className="text-[9px] font-bold truncate">{photo.title}</div>
          <div className="text-[7px] text-cy-text-light">{photo.date}</div>
        </div>
      </div>
    </button>
  )
}
