import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import CyLoader from '../../components/ui/CyLoader'
import PhotoCard from './PhotoCard'
import Lightbox from './Lightbox'
import type { GalleryImage } from '../../types'
import { getImages } from '../../services/images'

// 사진첩 = 게시글에 첨부된 모든 사진 모아보기
export default function PhotoPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<GalleryImage | null>(null)

  useEffect(() => {
    getImages({ page: 1, limit: 60 })
      .then((res) => setImages(res.data))
      .catch((err: any) => setError(err.response?.data?.error || '사진을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className='flex flex-col items-center px-4 h-full overflow-hidden'>
      <PageHeader title='Photo' subtitle='Album' />

      <div className='w-full h-full overflow-y-auto scrollbar-hide'>
        {error && <p className='text-[8px] text-cy-tag-red text-center py-2'>{error}</p>}
        {isLoading && !error ? (
          <CyLoader message='사진을 불러오는 중' className='py-8' />
        ) : !isLoading && !error && images.length === 0 ? (
          <div className='text-center py-8 text-cy-text-muted text-sm'>
            아직 사진이 없습니다
            <p className='text-[8px] mt-1'>게시글에 사진을 첨부하면 이곳에 모아져요 📸</p>
          </div>
        ) : (
          <div className='grid grid-cols-3 gap-3 p-1'>
            {images.map((image) => (
              <PhotoCard key={image.id} image={image} onSelect={() => setSelected(image)} />
            ))}
          </div>
        )}
      </div>

      {selected && <Lightbox image={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
