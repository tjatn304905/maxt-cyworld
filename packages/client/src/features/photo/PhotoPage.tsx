import { useEffect, useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import PostWriteModal from '../../components/shared/PostWriteModal'
import PhotoCard from './PhotoCard'
import Lightbox from './Lightbox'
import { usePostStore } from '../../store/postStore'
import { useRole } from '../../hooks/useRole'

const FALLBACK_COLORS = ['#ffcccc', '#cce5ff', '#ccffcc', '#ffddaa', '#99ffcc', '#ffccff']
const FALLBACK_EMOJIS = ['📸', '🎉', '🏖️', '🏆', '⛺', '🎄']

export default function PhotoPage() {
  const list = usePostStore((state) => state.lists.PHOTO)
  const { fetchPosts } = usePostStore()
  const { canWrite } = useRole()

  const [selected, setSelected] = useState<number | null>(null)
  const [writing, setWriting] = useState(false)

  useEffect(() => {
    fetchPosts('PHOTO', 1, 60)
  }, [fetchPosts])

  const selectedIdx = selected !== null ? list.posts.findIndex((p) => p.id === selected) : -1
  const selectedPhoto = selectedIdx >= 0 ? list.posts[selectedIdx] : null

  return (
    <div className='flex flex-col items-center px-4 h-full overflow-hidden'>
      <PageHeader
        title='Photo'
        subtitle='Album'
        action={canWrite ? { label: '📷 사진올리기', onClick: () => setWriting(true) } : undefined}
      />

      <div className='w-full h-full overflow-y-auto scrollbar-hide'>
        {list.posts.length === 0 ? (
          <div className='text-center py-8 text-cy-text-muted text-sm'>아직 사진이 없습니다</div>
        ) : (
          <div className='grid grid-cols-3 gap-3 p-1'>
            {list.posts.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                onSelect={() => setSelected(photo.id === selected ? null : photo.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          fallback={{
            color: FALLBACK_COLORS[selectedIdx % FALLBACK_COLORS.length],
            emoji: FALLBACK_EMOJIS[selectedIdx % FALLBACK_EMOJIS.length],
          }}
          onClose={() => setSelected(null)}
        />
      )}

      {writing && (
        <PostWriteModal
          postType='PHOTO'
          categories={['Photo']}
          requireImage
          onClose={() => setWriting(false)}
        />
      )}
    </div>
  )
}
