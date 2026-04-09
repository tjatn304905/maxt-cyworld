import { X } from 'lucide-react'
import type { PhotoItem } from '../../types'

interface LightboxProps {
  photo: PhotoItem
  emoji: string
  onClose: () => void
}

export default function Lightbox({ photo, emoji, onClose }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-4 max-w-[400px] w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2 right-2 cy-btn !p-1">
          <X size={12} />
        </button>
        <div
          className="aspect-video rounded-lg flex items-center justify-center pixel-render mb-2"
          style={{ backgroundColor: photo.color }}
        >
          <span className="text-[48px]">{emoji}</span>
        </div>
        <h3 className="text-[11px] font-bold">{photo.title}</h3>
        <p className="text-[9px] text-cy-text-light mt-1">{photo.description}</p>
        <p className="text-[8px] text-cy-text-light mt-1">📅 {photo.date}</p>
      </div>
    </div>
  )
}
