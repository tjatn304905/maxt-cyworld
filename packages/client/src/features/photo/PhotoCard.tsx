import type { GalleryImage } from '../../types'

interface PhotoCardProps {
  image: GalleryImage
  onSelect: () => void
}

export default function PhotoCard({ image, onSelect }: PhotoCardProps) {
  return (
    <button onClick={onSelect} className='cy-photo-frame'>
      <img
        src={image.imageUrl}
        alt={image.postTitle}
        className='aspect-square w-full object-cover rounded-sm'
      />
      <div className='mt-1 text-center'>
        <div className='text-[9px] font-bold truncate'>{image.postTitle}</div>
        <div className='text-[7px] text-cy-text-light'>{image.eventDate?.slice(0, 10)}</div>
      </div>
    </button>
  )
}
