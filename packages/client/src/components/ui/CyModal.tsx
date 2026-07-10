import { type ReactNode } from 'react'

interface CyModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export default function CyModal({ title, onClose, children }: CyModalProps) {
  return (
    <div className='cy-modal-overlay' onClick={onClose}>
      <div className='cy-modal' onClick={(e) => e.stopPropagation()}>
        <div className='cy-modal-header'>
          <span>{title}</span>
          <button
            type='button'
            onClick={onClose}
            className='cursor-pointer bg-transparent border-none text-white text-[10px]'
          >
            ✕
          </button>
        </div>
        <div className='p-3'>{children}</div>
      </div>
    </div>
  )
}
