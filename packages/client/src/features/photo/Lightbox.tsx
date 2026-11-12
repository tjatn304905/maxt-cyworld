import { useNavigate } from 'react-router-dom'
import type { GalleryImage } from '../../types'
import CyPhotoViewer from '../../components/shared/CyPhotoViewer'

interface LightboxProps {
  image: GalleryImage
  images?: GalleryImage[]
  onClose: () => void
}

export default function Lightbox({ image, images, onClose }: LightboxProps) {
  const navigate = useNavigate()
  const list = images && images.length > 0 ? images : [image]
  const initialIndex = Math.max(
    0,
    list.findIndex((item) => item.id === image.id)
  )

  return (
    <CyPhotoViewer
      images={list.map((item) => ({
        url: item.imageUrl,
        title: item.postTitle,
        date: item.eventDate,
      }))}
      initialIndex={initialIndex}
      onClose={onClose}
      action={{
        label: '게시글 보러가기 →',
        onClick: () => navigate(`/board/${image.postId}`),
      }}
    />
  )
}
