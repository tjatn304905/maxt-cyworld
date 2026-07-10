import { useNavigate } from 'react-router-dom'
import type { GalleryImage } from '../../types'
import CyModal from '../../components/ui/CyModal'
import CyButton from '../../components/ui/CyButton'

interface LightboxProps {
  image: GalleryImage
  onClose: () => void
}

export default function Lightbox({ image, onClose }: LightboxProps) {
  const navigate = useNavigate()

  return (
    <CyModal title={`PHOTO · ${image.eventDate?.slice(0, 10) ?? ''}`} onClose={onClose}>
      <img
        src={image.imageUrl}
        alt={image.postTitle}
        className='w-full rounded-sm border border-cy-border-light'
      />
      <h3 className='text-[11px] font-bold mt-2'>{image.postTitle}</h3>
      <p className='text-[8px] text-cy-text-muted mt-0.5'>📅 {image.eventDate?.slice(0, 10)}</p>
      <div className='flex justify-end gap-1 mt-2'>
        <CyButton size='sm' onClick={onClose}>닫기</CyButton>
        <CyButton
          size='sm'
          variant='active'
          onClick={() => navigate(`/board/${image.postId}`)}
        >
          게시글 보러가기 →
        </CyButton>
      </div>
    </CyModal>
  )
}
