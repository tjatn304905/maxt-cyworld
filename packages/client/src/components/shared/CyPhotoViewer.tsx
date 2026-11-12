import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface CyPhotoViewerItem {
  url: string
  title?: string
  date?: string
  author?: string
}

interface CyPhotoViewerProps {
  images: CyPhotoViewerItem[]
  initialIndex?: number
  onClose: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export default function CyPhotoViewer({
  images,
  initialIndex = 0,
  onClose,
  action,
}: CyPhotoViewerProps) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1))
  )

  const total = images.length
  const current = images[index]
  const canPrev = index > 0
  const canNext = index < total - 1

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && index > 0) {
        setIndex((i) => i - 1)
      } else if (e.key === 'ArrowRight' && index < total - 1) {
        setIndex((i) => i + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [index, total, onClose])

  if (!current) return null

  const formattedDate = current.date?.slice(0, 10).replace(/-/g, '.') ?? ''

  return createPortal(
    <div
      className='cy-viewer-backdrop'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
      aria-label={current.title || '사진 크게 보기'}
    >
      <div className='cy-viewer-shell' onClick={(e) => e.stopPropagation()}>
        <div className='cy-viewer-dashed'>
          <div className='cy-viewer-window'>
            {/* top bar */}
            <header className='cy-viewer-header'>
              <div className='flex items-center gap-3 min-w-0'>
                <span className='cy-viewer-badge'>PHOTO ALBUM</span>
                {formattedDate && (
                  <span className='cy-viewer-header-date'>{formattedDate}</span>
                )}
              </div>
              <div className='flex items-center gap-2.5 shrink-0'>
                {total > 1 && (
                  <span className='cy-viewer-counter'>
                    {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                )}
                <button
                  type='button'
                  onClick={onClose}
                  aria-label='뷰어 닫기'
                  className='cy-viewer-close'
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
            </header>

            {/* polaroid stage */}
            <div className='cy-viewer-stage'>
              {total > 1 && (
                <button
                  type='button'
                  disabled={!canPrev}
                  onClick={() => setIndex((i) => i - 1)}
                  aria-label='이전 사진'
                  className='cy-viewer-nav cy-viewer-nav-prev'
                >
                  <ChevronLeft size={24} strokeWidth={2.4} />
                </button>
              )}

              <figure className='cy-viewer-polaroid'>
                <div className='cy-viewer-mat'>
                  <img
                    key={current.url}
                    src={current.url}
                    alt={current.title || '첨부 사진'}
                    className='cy-viewer-img'
                  />
                </div>
                {(current.title || formattedDate || current.author) && (
                  <figcaption className='cy-viewer-caption'>
                    <div className='min-w-0 flex-1'>
                      {current.title && (
                        <p className='cy-viewer-title'>{current.title}</p>
                      )}
                      {(current.author || formattedDate) && (
                        <p className='cy-viewer-meta'>
                          {current.author ? `by ${current.author}` : ''}
                          {current.author && formattedDate ? ' · ' : ''}
                          {formattedDate}
                        </p>
                      )}
                    </div>
                    {formattedDate && (
                      <span className='cy-viewer-stamp'>{formattedDate}</span>
                    )}
                  </figcaption>
                )}
              </figure>

              {total > 1 && (
                <button
                  type='button'
                  disabled={!canNext}
                  onClick={() => setIndex((i) => i + 1)}
                  aria-label='다음 사진'
                  className='cy-viewer-nav cy-viewer-nav-next'
                >
                  <ChevronRight size={24} strokeWidth={2.4} />
                </button>
              )}
            </div>

            {/* thumbnail filmstrip for multi-photo posts */}
            {total > 1 && (
              <div className='cy-viewer-strip scrollbar-hide'>
                {images.map((item, idx) => (
                  <button
                    key={`${item.url}-${idx}`}
                    type='button'
                    onClick={() => setIndex(idx)}
                    aria-label={`${idx + 1}번째 사진 보기`}
                    className={`cy-viewer-thumb ${idx === index ? 'active' : ''}`}
                  >
                    <img src={item.url} alt='' />
                  </button>
                ))}
              </div>
            )}

            {/* bottom action bar */}
            <footer className='cy-viewer-footer'>
              <span className='cy-viewer-hint'>
                {total > 1 ? '← → 방향키로 이동 · ESC 닫기' : 'ESC 또는 바깥 영역을 눌러 닫기'}
              </span>
              <div className='flex items-center gap-2'>
                {action && (
                  <button
                    type='button'
                    className='cy-viewer-btn cy-viewer-btn-active'
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                )}
                <button
                  type='button'
                  className='cy-viewer-btn'
                  onClick={onClose}
                >
                  닫기
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
