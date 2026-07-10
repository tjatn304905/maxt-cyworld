import { useState, type FormEvent } from 'react'
import CyModal from '../../components/ui/CyModal'
import CyInput from '../../components/ui/CyInput'
import CyButton from '../../components/ui/CyButton'
import { useAuthStore } from '../../store/authStore'
import { useBookExport, type BookExportStep } from './useBookExport'
import { BOARD_CATEGORIES } from '../board/categories'

interface BookExportModalProps {
  onClose: () => void
}

const STEP_LABELS: Record<BookExportStep, string> = {
  idle: '',
  fetching: '📜 게시글을 수집하는 중...',
  fonts: '🖋 활자(폰트)를 준비하는 중...',
  images: '🖼 사진을 옮겨 담는 중...',
  building: '📖 책을 엮는 중... (잠시 걸릴 수 있어요)',
  done: '✅ 역사서가 완성되어 다운로드되었습니다!',
  error: '',
}

export default function BookExportModal({ onClose }: BookExportModalProps) {
  const user = useAuthStore((state) => state.user)
  const { step, imageProgress, error, skippedImages, run, reset } = useBookExport()

  const [title, setTitle] = useState('MAXT 팀 역사서')
  const [subtitle, setSubtitle] = useState('사이좋은 사람들의 기록')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [category, setCategory] = useState('')
  const [pageSize, setPageSize] = useState<'A5' | 'A4'>('A5')

  const isRunning = step === 'fetching' || step === 'fonts' || step === 'images' || step === 'building'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await run({
      title: title.trim(),
      subtitle: subtitle.trim(),
      pageSize,
      compiler: user?.nickname ?? user?.name ?? '사관',
      from: from || undefined,
      to: to || undefined,
      category: category || undefined,
    })
  }

  return (
    <CyModal title='HISTORY BOOK' onClose={isRunning ? () => undefined : onClose}>
      <form onSubmit={handleSubmit} className='cy-write-panel flex flex-col gap-2'>
        <p className='text-[9px] text-cy-text-light'>
          게시글을 책 형태(표지·목차·챕터·쪽수)로 엮어 PDF로 내려받습니다.
        </p>

        <div className='flex flex-col gap-1'>
          <label className='text-[8px] font-bold text-cy-text'>책 제목</label>
          <CyInput value={title} onChange={(e) => setTitle(e.target.value)} disabled={isRunning} />
          <label className='text-[8px] font-bold text-cy-text'>부제</label>
          <CyInput value={subtitle} onChange={(e) => setSubtitle(e.target.value)} disabled={isRunning} />
        </div>

        <div className='flex gap-1.5 items-center flex-wrap'>
          <label className='text-[8px] font-bold text-cy-text'>기간</label>
          <input
            type='date' value={from} onChange={(e) => setFrom(e.target.value)} disabled={isRunning}
            className='text-[9px] bg-white border-[1.5px] border-[#ABABAB] rounded-md px-1 py-0.5 font-[inherit] outline-none'
          />
          <span className='text-[9px]'>~</span>
          <input
            type='date' value={to} onChange={(e) => setTo(e.target.value)} disabled={isRunning}
            className='text-[9px] bg-white border-[1.5px] border-[#ABABAB] rounded-md px-1 py-0.5 font-[inherit] outline-none'
          />
          <select
            value={category} onChange={(e) => setCategory(e.target.value)} disabled={isRunning}
            className='text-[9px] bg-white border-[1.5px] border-[#ABABAB] rounded-md px-1 py-0.5 font-[inherit] outline-none'
          >
            <option value=''>전체 카테고리</option>
            {BOARD_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className='flex gap-2 items-center'>
          <label className='text-[8px] font-bold text-cy-text'>판형</label>
          {(['A5', 'A4'] as const).map((size) => (
            <label key={size} className='flex items-center gap-0.5 text-[9px] cursor-pointer'>
              <input
                type='radio' name='pageSize' checked={pageSize === size}
                onChange={() => setPageSize(size)} disabled={isRunning}
              />
              {size} {size === 'A5' ? '(단행본)' : '(일반 인쇄)'}
            </label>
          ))}
        </div>

        {isRunning && (
          <div className='cy-panel !bg-white text-[9px] text-cy-cyan-dark'>
            {STEP_LABELS[step]}
            {step === 'images' && imageProgress.total > 0 && (
              <span className='ml-1 text-cy-text-muted'>
                ({imageProgress.done}/{imageProgress.total})
              </span>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className='cy-panel !bg-white text-[9px] text-cy-cyan-dark'>
            {STEP_LABELS.done}
            {skippedImages > 0 && (
              <p className='text-cy-text-muted mt-0.5'>
                ⚠ 불러오지 못한 사진 {skippedImages}장은 제외되었습니다.
              </p>
            )}
          </div>
        )}

        {step === 'error' && error && (
          <p className='text-[9px] text-cy-tag-red'>{error}</p>
        )}

        <div className='flex justify-end gap-1'>
          {step === 'done' ? (
            <>
              <CyButton type='button' onClick={reset}>다시 만들기</CyButton>
              <CyButton type='button' variant='active' onClick={onClose}>닫기</CyButton>
            </>
          ) : (
            <>
              <CyButton type='button' onClick={onClose} disabled={isRunning}>취소</CyButton>
              <CyButton type='submit' variant='active' disabled={isRunning}>
                {isRunning ? '편찬 중...' : step === 'error' ? '다시 시도' : '📖 편찬하기'}
              </CyButton>
            </>
          )}
        </div>
      </form>
    </CyModal>
  )
}
