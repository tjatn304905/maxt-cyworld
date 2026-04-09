import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import PhotoCard from './PhotoCard'
import Lightbox from './Lightbox'
import { PHOTO_DATA, EMOJIS } from './data'

export default function PhotoPage() {
  const [selected, setSelected] = useState<number | null>(null)

  const selectedPhoto = selected !== null ? PHOTO_DATA.find((p) => p.id === selected) : null
  const selectedIdx = selected !== null ? PHOTO_DATA.findIndex((p) => p.id === selected) : -1

  return (
    <div className="flex flex-col items-center px-4 h-full overflow-hidden">
      <PageHeader title="Photo" subtitle="Album" />

      <div className="grid grid-cols-3 gap-2">
        {PHOTO_DATA.map((photo, i) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            emoji={EMOJIS[i]}
            isSelected={photo.id === selected}
            onSelect={() => setSelected(photo.id === selected ? null : photo.id)}
          />
        ))}
      </div>

      {selectedPhoto && selectedIdx >= 0 && (
        <Lightbox
          photo={selectedPhoto}
          emoji={EMOJIS[selectedIdx]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
